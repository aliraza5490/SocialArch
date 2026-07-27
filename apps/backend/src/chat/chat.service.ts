import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "./entities/Chat.entity";
import { Message } from "./entities/Message.entity";
import { CreateChatDto } from "./dto/create-chat.dto";
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

  async create(userId: string, createChatDto: CreateChatDto): Promise<Chat> {
    const chat = this.chatRepository.create({
      ...createChatDto,
      userId,
    });
    return this.chatRepository.save(chat);
  }

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

  async addMessage(
    chatId: string,
    role: "user" | "assistant",
    content: string,
    position?: number,
  ): Promise<Message> {
    let finalPosition = position;
    let finalVersion = 1;

    if (position !== undefined) {
      const maxVersionMessage = await this.messageRepository.findOne({
        where: { chatId, position },
        order: { version: "DESC" },
      });
      finalVersion = (maxVersionMessage?.version || 0) + 1;
    } else {
      const lastMessage = await this.messageRepository.findOne({
        where: { chatId },
        order: { position: "DESC" },
      });
      finalPosition = (lastMessage?.position ?? -1) + 1;
    }

    const message = this.messageRepository.create({
      chatId,
      role,
      content,
      position: finalPosition,
      version: finalVersion,
    });
    return this.messageRepository.save(message);
  }

  async getMessageHistory(chatId: string): Promise<Message[]> {
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
      const newChatObj = await this.create(userId, { title });
      targetChatId = newChatObj.ID;
    } else {
      await this.findOne(targetChatId, userId);
    }

    // 2. Save user message
    const userMessage = await this.addMessage(
      targetChatId,
      "user",
      content,
      position,
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
    await this.addMessage(
      targetChatId,
      "assistant",
      fullAssistantContent,
      finalPosition + 1,
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
    await this.addMessage(
      chatId,
      "assistant",
      fullAssistantContent,
      position,
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
