import { Injectable } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatService } from "@/chat/chat.service";
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

  async createChatCompletion(chatId: string, userId: string, content: string, parentMessageId: string, res: Response) {
    // 1. Save user message
    const userMessage = await this.chatService.addMessage(chatId, "user", content, parentMessageId);

    // 2. Get history for context
    const history = await this.chatService.getMessageHistory(chatId);
    
    // 3. Convert history to LangChain messages
    const messages = history.map((msg) => {
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
      // Save assistant message when stream completes
      await this.chatService.addMessage(chatId, "assistant", fullContent, userMessage.ID);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }

  async regenerateResponse(chatId: string, userId: string, parentMessageId: string, res: Response) {
    // 1. Get history up to the parent message
    const fullHistory = await this.chatService.getMessageHistory(chatId);
    
    // Find the index of the parent message (which should be a user message)
    const parentIndex = fullHistory.findIndex(m => m.ID === parentMessageId);
    if (parentIndex === -1) throw new Error("Parent message not found");

    const historyForContext = fullHistory.slice(0, parentIndex + 1);

    // 2. Convert to LangChain messages
    const messages = historyForContext.map((msg) => {
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
      // Save assistant message as a new version
      await this.chatService.addMessage(chatId, "assistant", fullContent, parentMessageId);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
}
