import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "./entities/Chat.entity";
import { Message } from "./entities/Message.entity";
import { UpdateChatDto } from "./dto/update-chat.dto";
import { AgentService } from "@/agent/agent.service";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { Response } from "express";

type ChatListItem = {
  ID: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  title: string;
  userId: string;
  preview: string;
};

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private agentService: AgentService,
  ) {}

  async findAll(userId: string): Promise<ChatListItem[]> {
    const chats = await this.chatRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    const chatsWithPreview = await Promise.all(
      chats.map(async (chat) => {
        const latestMessage = await this.messageRepository.findOne({
          where: { chatId: chat.ID },
          order: { createdAt: "DESC", position: "DESC", version: "DESC" },
        });

        return {
          ID: chat.ID,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          deletedAt: chat.deletedAt ?? null,
          title: chat.title,
          userId: chat.userId,
          preview: latestMessage?.content || "No messages yet...",
        };
      }),
    );

    return chatsWithPreview;
  }

  async findOne(id: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { ID: id, userId },
      relations: ["messages"],
    });
    if (!chat) {
      throw new NotFoundException("Chat not found");
    }
    return chat;
  }

  async update(
    id: string,
    userId: string,
    updateChatDto: UpdateChatDto,
  ): Promise<Chat> {
    const chat = await this.findOne(id, userId);
    Object.assign(chat, updateChatDto);
    return this.chatRepository.save(chat);
  }

  async remove(id: string, userId: string): Promise<void> {
    const chat = await this.findOne(id, userId);
    await this.chatRepository.softRemove(chat);
  }

  async getMessageHistory(chatId: string, userId?: string): Promise<Message[]> {
    if (userId) {
      await this.findOne(chatId, userId);
    }
    return this.messageRepository.find({
      where: { chatId },
      order: { createdAt: "ASC" },
    });
  }

  async createChatCompletion(
    chatId: string | undefined,
    userId: string,
    content: string,
    res: Response,
    position?: number,
    selectedVersions?: Record<number, number>,
    newChat?: boolean,
  ) {
    let targetChatId = chatId;

    // 1. Resolve or create chat
    if (newChat || !targetChatId) {
      const title = content ? content.trim().slice(0, 50) : "New Chat";
      const chat = this.chatRepository.create({ title, userId });
      const newChatObj = await this.chatRepository.save(chat);
      targetChatId = newChatObj.ID;
    } else {
      await this.findOne(targetChatId, userId);
    }

    // 2. Save user message
    let userPosition = position;
    let userVersion = 1;

    if (userPosition !== undefined) {
      const maxVersionMessage = await this.messageRepository.findOne({
        where: { chatId: targetChatId, position: userPosition },
        order: { version: "DESC" },
      });
      userVersion = (maxVersionMessage?.version || 0) + 1;
    } else {
      const lastMessage = await this.messageRepository.findOne({
        where: { chatId: targetChatId },
        order: { position: "DESC" },
      });
      userPosition = (lastMessage?.position ?? -1) + 1;
    }

    const userMessage = await this.messageRepository.save(
      this.messageRepository.create({
        chatId: targetChatId,
        role: "user",
        content,
        position: userPosition,
        version: userVersion,
      }),
    );

    const finalPosition = userMessage.position;

    // 3. Get history for context
    const fullHistory = await this.getMessageHistory(targetChatId);

    const historyForContext = this.filterHistoryByVersion(
      fullHistory,
      selectedVersions || {},
    );

    const filteredHistory = historyForContext.filter(
      (m) => m.position < finalPosition,
    );
    filteredHistory.push(userMessage);

    filteredHistory.sort((a, b) => a.position - b.position);

    // 4. Convert history to LangChain messages
    const messages: BaseMessage[] = filteredHistory.map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      return new AIMessage(msg.content);
    });

    // 5. Stream response via AgentService
    const fullAssistantContent = await this.agentService.streamResponse(
      messages,
      res,
      targetChatId,
    );

    // 6. Save assistant message at next position
    const assistPosition = finalPosition + 1;
    const maxAssistVersion = await this.messageRepository.findOne({
      where: { chatId: targetChatId, position: assistPosition },
      order: { version: "DESC" },
    });
    const assistVersion = (maxAssistVersion?.version || 0) + 1;

    await this.messageRepository.save(
      this.messageRepository.create({
        chatId: targetChatId,
        role: "assistant",
        content: fullAssistantContent,
        position: assistPosition,
        version: assistVersion,
      }),
    );
  }

  async regenerateResponse(
    chatId: string,
    userId: string,
    position: number,
    res: Response,
    selectedVersions?: Record<number, number>,
  ) {
    // 1. Verify chat ownership
    await this.findOne(chatId, userId);

    // 2. Get history up to the position
    const fullHistory = await this.getMessageHistory(chatId);

    const historyForContext = this.filterHistoryByVersion(
      fullHistory,
      selectedVersions || {},
    );

    const filteredHistory = historyForContext.filter(
      (m) => m.position < position,
    );

    // 3. Convert to LangChain messages
    const messages: BaseMessage[] = filteredHistory.map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      return new AIMessage(msg.content);
    });

    // 4. Stream response via AgentService
    const fullAssistantContent = await this.agentService.streamResponse(
      messages,
      res,
    );

    // 5. Save new version of assistant message
    const maxAssistVersion = await this.messageRepository.findOne({
      where: { chatId, position },
      order: { version: "DESC" },
    });
    const assistVersion = (maxAssistVersion?.version || 0) + 1;

    await this.messageRepository.save(
      this.messageRepository.create({
        chatId,
        role: "assistant",
        content: fullAssistantContent,
        position,
        version: assistVersion,
      }),
    );
  }

  private filterHistoryByVersion(
    messages: Message[],
    selectedVersions: Record<number, number>,
  ): Message[] {
    const messagesByPosition = new Map<number, Message[]>();
    messages.forEach((m) => {
      if (!messagesByPosition.has(m.position)) {
        messagesByPosition.set(m.position, []);
      }
      messagesByPosition.get(m.position)!.push(m);
    });

    const result: Message[] = [];
    messagesByPosition.forEach((versions, position) => {
      const selectedV = selectedVersions[position];
      let chosen: Message | undefined;
      if (selectedV !== undefined) {
        chosen = versions.find((v) => v.version === selectedV);
      }
      if (!chosen) {
        versions.sort((a, b) => b.version - a.version);
        chosen = versions[0];
      }
      result.push(chosen);
    });

    return result.sort((a, b) => a.position - b.position);
  }
}
