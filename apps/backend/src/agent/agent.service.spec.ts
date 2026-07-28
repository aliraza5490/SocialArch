import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AgentService } from "./agent.service";
import { HumanMessage, AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { Response } from "express";
import {
  contentIdeaGeneratorTool,
  hashtagGeneratorTool,
  postOptimizerTool,
} from "./tools/content.tools";

describe("Agent Tools & AgentService", () => {
  let service: AgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === "MODEL_NAME") return "gemini-3.6-flash";
              if (key === "GEMINI_API_KEY") return "test-api-key";
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  describe("Individual Tools Execution", () => {
    it("should generate content ideas via contentIdeaGeneratorTool", async () => {
      const resultStr = await contentIdeaGeneratorTool.invoke({
        topic: "Artificial Intelligence",
        targetAudience: "Developers",
      });

      const result = JSON.parse(resultStr);
      expect(result.topic).toBe("Artificial Intelligence");
      expect(result.targetAudience).toBe("Developers");
      expect(Array.isArray(result.ideas)).toBe(true);
      expect(result.ideas.length).toBeGreaterThan(0);
    });

    it("should generate hashtags via hashtagGeneratorTool", async () => {
      const resultStr = await hashtagGeneratorTool.invoke({
        topic: "ReactJS",
        platform: "twitter",
      });

      const result = JSON.parse(resultStr);
      expect(result.topic).toBe("ReactJS");
      expect(result.platform).toBe("twitter");
      expect(Array.isArray(result.hashtags)).toBe(true);
      expect(result.hashtags).toContain("#reactjs");
    });

    it("should optimize post draft via postOptimizerTool", async () => {
      const resultStr = await postOptimizerTool.invoke({
        draftText: "Check out our new AI feature for social media!",
        platform: "LinkedIn",
      });

      const result = JSON.parse(resultStr);
      expect(result.platform).toBe("LinkedIn");
      expect(result.originalLength).toBe(46);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe("AgentService Info & Config", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });

    it("should return model name", () => {
      expect(service.getModelName()).toBe("gemini-3.6-flash");
    });

    it("should return agent info with registered tools", () => {
      const info = service.getAgentInfo();
      expect(info.name).toBe("SocialArch AI Agent");
      expect(info.model).toBe("gemini-3.6-flash");
      expect(info.tools.length).toBe(3);

      const toolNames = info.tools.map((t) => t.name);
      expect(toolNames).toContain("content_idea_generator");
      expect(toolNames).toContain("hashtag_generator");
      expect(toolNames).toContain("post_optimizer");
    });
  });

  describe("AgentService streamResponse with Tool Invocation", () => {
    function createMockResponse(): Response {
      const res: any = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        flushHeaders: jest.fn(),
        flush: jest.fn(),
      };
      return res as Response;
    }

    it("should stream standard text response when no tools are called", async () => {
      const res = createMockResponse();

      const mockChunk = new AIMessageChunk({
        content: "Here is your response.",
      });

      const mockModelWithTools = {
        stream: jest.fn().mockResolvedValue([mockChunk]),
      };

      (service as any).model = {
        bindTools: jest.fn().mockReturnValue(mockModelWithTools),
      };

      const result = await service.streamResponse(
        [new HumanMessage("Hello")],
        res,
        "chat-123"
      );

      expect(result).toBe("Here is your response.");
      expect(res.write).toHaveBeenCalledWith(
        `data: ${JSON.stringify({ chatId: "chat-123" })}\n\n`
      );
      expect(res.write).toHaveBeenCalledWith(
        `data: ${JSON.stringify({ content: "Here is your response." })}\n\n`
      );
      expect(res.write).toHaveBeenCalledWith("data: [DONE]\n\n");
      expect(res.end).toHaveBeenCalled();
    });

    it("should execute tool calls and stream follow-up response", async () => {
      const res = createMockResponse();

      // First stream turn: Model returns tool call
      const toolCallChunk = new AIMessageChunk({
        content: "",
        tool_calls: [
          {
            name: "hashtag_generator",
            args: { topic: "AI", platform: "instagram" },
            id: "call_abc123",
          },
        ],
      });

      // Second stream turn: Model returns text based on tool result
      const finalChunk = new AIMessageChunk({
        content: "Here are hashtags for AI: #ai #digitalgrowth",
      });

      let callCount = 0;
      const mockModelWithTools = {
        stream: jest.fn().mockImplementation(async (messages: BaseMessage[]) => {
          callCount++;
          if (callCount === 1) {
            return [toolCallChunk];
          } else {
            // Verify tool message was added to conversation history for turn 2
            const lastMsg = messages[messages.length - 1];
            expect(lastMsg.constructor.name).toBe("ToolMessage");
            expect((lastMsg as any).name).toBe("hashtag_generator");
            return [finalChunk];
          }
        }),
      };

      (service as any).model = {
        bindTools: jest.fn().mockReturnValue(mockModelWithTools),
      };

      const result = await service.streamResponse(
        [new HumanMessage("Give me hashtags for AI")],
        res
      );

      expect(result).toBe("Here are hashtags for AI: #ai #digitalgrowth");
      expect(callCount).toBe(2);
      expect(res.write).toHaveBeenCalledWith(
        `data: ${JSON.stringify({
          content: "Here are hashtags for AI: #ai #digitalgrowth",
        })}\n\n`
      );
      expect(res.end).toHaveBeenCalled();
    });
  });
});
