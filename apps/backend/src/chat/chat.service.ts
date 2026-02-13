import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "./entities/Chat.entity";
import { Message } from "./entities/Message.entity";
import { CreateChatDto } from "./dto/create-chat.dto";
import { UpdateChatDto } from "./dto/update-chat.dto";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(userId: string, createChatDto: CreateChatDto): Promise<Chat> {
    const chat = this.chatRepository.create({
      ...createChatDto,
      userId,
    });
    return this.chatRepository.save(chat);
  }

  async findAll(userId: string): Promise<Chat[]> {
    return this.chatRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { ID: id, userId },
      relations: ["messages"],
    });
    if (!chat) {
      throw new NotFoundException("Chat not found");
    }
    // Sort messages by creation date if needed, though with parent/child it's more complex
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
      // Adding a new version for an existing position
      const maxVersionMessage = await this.messageRepository.findOne({
        where: { chatId, position },
        order: { version: "DESC" },
      });
      finalVersion = (maxVersionMessage?.version || 0) + 1;
    } else {
      // Adding a new message to the end of the chat
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
}
