import { Injectable } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatService } from "@/chat/chat.service";
import { Message } from "@/chat/entities/Message.entity";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

@Injectable()
export class AiService {
  private model: ChatOpenAI;

  constructor(
    private chatService: ChatService,
    private configService: ConfigService,
  ) {
    this.model = new ChatOpenAI({
      apiKey: this.configService.get<string>("OPENAI_API_KEY"),
      modelName: "openai/gpt-oss-20b",
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
      streaming: true,
    });
  }

  async createChatCompletion(
    chatId: string,
    userId: string,
    content: string,
    res: Response,
    position?: number,
    selectedVersions?: Record<number, number>,
  ) {
    // 1. Save user message at the specified position or end of chat
    const userMessage = await this.chatService.addMessage(
      chatId,
      "user",
      content,
      position,
    );

    const finalPosition = userMessage.position;

    // 2. Get history for context.
    const fullHistory = await this.chatService.getMessageHistory(chatId);

    // Filter history to only include the correct versions leading up to the new message
    const historyForContext = this.filterHistoryByVersion(
      fullHistory,
      selectedVersions || {},
    );

    // Ensure we only include messages with position <= finalPosition
    const filteredHistory = historyForContext.filter(
      (m) => m.position < finalPosition,
    );
    filteredHistory.push(userMessage);

    // Sort to ensure correct order for AI
    filteredHistory.sort((a, b) => a.position - b.position);

    // 3. Convert history to LangChain messages
    const messages = filteredHistory.map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      return new AIMessage(msg.content);
    });

    // 4. Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 5. Stream response
    let fullContent = "";

    try {
      const stream = await this.model.stream(messages);

      for await (const chunk of stream) {
        const text = chunk.content as string;
        if (text) {
          fullContent += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }
    } finally {
      // Save assistant message at the next position
      await this.chatService.addMessage(
        chatId,
        "assistant",
        fullContent,
        finalPosition + 1,
      );
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }

  async regenerateResponse(
    chatId: string,
    userId: string,
    position: number,
    res: Response,
    selectedVersions?: Record<number, number>,
  ) {
    // 1. Get history up to the message at 'position'
    const fullHistory = await this.chatService.getMessageHistory(chatId);

    // Filter history to only include the correct versions leading up to this position
    const historyForContext = this.filterHistoryByVersion(
      fullHistory,
      selectedVersions || {},
    );

    // We want the context up to the message BEFORE this position
    const filteredHistory = historyForContext.filter(
      (m) => m.position < position,
    );

    // 2. Convert to LangChain messages
    const messages = filteredHistory.map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      return new AIMessage(msg.content);
    });

    // 3. Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 4. Stream response
    let fullContent = "";

    try {
      const stream = await this.model.stream(messages);

      for await (const chunk of stream) {
        const text = chunk.content as string;
        if (text) {
          fullContent += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }
    } finally {
      // Save assistant message as a new version for this position
      await this.chatService.addMessage(
        chatId,
        "assistant",
        fullContent,
        position,
      );
      res.write("data: [DONE]\n\n");
      res.end();
    }
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
        // Default to latest
        versions.sort((a, b) => b.version - a.version);
        chosen = versions[0];
      }
      result.push(chosen);
    });

    return result.sort((a, b) => a.position - b.position);
  }
}
