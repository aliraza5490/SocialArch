import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  BaseMessage,
  SystemMessage,
  AIMessageChunk,
  ToolMessage,
} from "@langchain/core/messages";
import { Response } from "express";
import { SYSTEM_PROMPT } from "./prompts/agent.prompt";
import { agentTools } from "./tools/content.tools";

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private model: BaseChatModel;
  private readonly modelName: string;

  constructor(private configService: ConfigService) {
    this.modelName =
      this.configService.get<string>("MODEL_NAME") || "gemini-3.6-flash";
    this.model = this.initializeModel();
  }

  private initializeModel(): BaseChatModel {
    const geminiApiKey =
      this.configService.get<string>("GEMINI_API_KEY") || "dummy-key";

    this.logger.log(
      `Initializing ChatGoogleGenerativeAI with model: ${this.modelName}`
    );

    return new ChatGoogleGenerativeAI({
      apiKey: geminiApiKey,
      model: this.modelName,
      streaming: true,
    });
  }

  public getModelName(): string {
    return this.modelName;
  }

  public getAgentInfo() {
    return {
      name: "SocialArch AI Agent",
      model: this.modelName,
      tools: agentTools.map((t) => ({
        name: t.name,
        description: t.description,
      })),
      capabilities: [
        "Social Media Content Strategy",
        "Engaging Post & Caption Generation",
        "Hashtag & Keyword Optimization",
        "Audience Engagement Advice",
      ],
    };
  }

  async streamResponse(
    messagesHistory: BaseMessage[],
    res: Response,
    chatId?: string,
  ): Promise<string> {
    const systemMsg = new SystemMessage(SYSTEM_PROMPT);
    const fullMessageList = [systemMsg, ...messagesHistory];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Content-Encoding", "none");

    if (typeof (res as any).flushHeaders === "function") {
      (res as any).flushHeaders();
    }

    const safeFlush = () => {
      if (typeof (res as any).flush === "function") {
        (res as any).flush();
      }
    };

    if (chatId) {
      res.write(`data: ${JSON.stringify({ chatId })}\n\n`);
      safeFlush();
    }

    let fullText = "";
    const toolsMap = new Map<string, any>(agentTools.map((t) => [t.name, t]));
    const maxIterations = 5;
    let iteration = 0;

    try {
      const modelWithTools = this.model.bindTools
        ? this.model.bindTools(agentTools)
        : this.model;

      while (iteration < maxIterations) {
        iteration++;
        let aggregatedChunk: AIMessageChunk | null = null;

        const stream = await modelWithTools.stream(fullMessageList);

        for await (const chunk of stream) {
          if (!aggregatedChunk) {
            aggregatedChunk = chunk as AIMessageChunk;
          } else {
            aggregatedChunk = aggregatedChunk.concat(chunk as AIMessageChunk);
          }

          let chunkContent = "";

          if (typeof chunk.content === "string") {
            chunkContent = chunk.content;
          } else if (Array.isArray(chunk.content)) {
            chunkContent = chunk.content
              .map((c: any) => (typeof c === "string" ? c : c.text || ""))
              .join("");
          }

          if (chunkContent) {
            fullText += chunkContent;
            res.write(`data: ${JSON.stringify({ content: chunkContent })}\n\n`);
            safeFlush();
          }
        }

        const toolCalls = aggregatedChunk?.tool_calls;
        if (!toolCalls || toolCalls.length === 0) {
          break;
        }

        fullMessageList.push(aggregatedChunk!);

        for (const toolCall of toolCalls) {
          const tool = toolsMap.get(toolCall.name);
          let toolResult: string;

          this.logger.log(
            `Executing tool '${toolCall.name}' with args: ${JSON.stringify(toolCall.args)}`
          );

          if (tool) {
            try {
              const rawResult = await tool.invoke(toolCall.args as any);
              toolResult =
                typeof rawResult === "string"
                  ? rawResult
                  : JSON.stringify(rawResult);
            } catch (toolErr: any) {
              this.logger.error(
                `Error executing tool '${toolCall.name}': ${toolErr.message}`
              );
              toolResult = JSON.stringify({
                error: `Tool execution failed: ${toolErr.message}`,
              });
            }
          } else {
            this.logger.warn(`Tool '${toolCall.name}' not found.`);
            toolResult = JSON.stringify({
              error: `Tool '${toolCall.name}' is not registered.`,
            });
          }

          fullMessageList.push(
            new ToolMessage({
              content: toolResult,
              tool_call_id: toolCall.id || "",
              name: toolCall.name,
            })
          );
        }
      }
    } catch (err: any) {
      this.logger.error(
        `Error during agent stream execution: ${err.message}`,
        err.stack
      );
      if (!fullText) {
        const errorFallback =
          "I apologize, but I encountered an error connecting to the language model service. Please ensure your GEMINI_API_KEY is configured.";
        fullText = errorFallback;
        res.write(`data: ${JSON.stringify({ content: errorFallback })}\n\n`);
        safeFlush();
      }
    } finally {
      res.write("data: [DONE]\n\n");
      safeFlush();
      res.end();
    }

    return fullText;
  }
}

