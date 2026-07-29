import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

export const contentIdeaGeneratorTool = tool(
  async ({ topic, targetAudience }) => {
    return JSON.stringify({
      topic,
      targetAudience: targetAudience || "General",
      ideas: [
        {
          title: `5 Key Myths About ${topic}`,
          format: "Carousel / Infographic",
          hook: `Stop making these mistakes with ${topic}!`,
        },
        {
          title: `How to Master ${topic} in 30 Days`,
          format: "Short Video / Reel",
          hook: `The exact step-by-step framework to master ${topic}.`,
        },
        {
          title: `Before vs After: Transform Your ${topic}`,
          format: "Case Study / Thread",
          hook: `Here's what changed when we optimized ${topic}...`,
        },
      ],
    });
  },
  {
    name: "content_idea_generator",
    description: "Generates creative social media content ideas for a given topic and target audience.",
    schema: z.object({
      topic: z.string().describe("The primary subject or topic for content creation"),
      targetAudience: z.string().optional().describe("The intended audience (e.g. beginners, founders, developers)"),
    }),
  }
);

export const hashtagGeneratorTool = tool(
  async ({ topic, platform }) => {
    const cleanTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, "");
    return JSON.stringify({
      topic,
      platform: platform || "general",
      hashtags: [
        `#${cleanTopic}`,
        `#${cleanTopic}Tips`,
        `#${cleanTopic}Strategy`,
        `#ContentCreation`,
        `#SocialArchAI`,
        `#DigitalGrowth`,
        `#TrendingNow`,
      ],
    });
  },
  {
    name: "hashtag_generator",
    description: "Generates targeted, high-performing hashtags for a specific topic and social media platform.",
    schema: z.object({
      topic: z.string().describe("Topic or niche for hashtags"),
      platform: z.enum(["instagram", "linkedin", "twitter", "tiktok", "general"]).optional().describe("Target social media platform"),
    }),
  }
);

export const postOptimizerTool = tool(
  async ({ draftText, platform }) => {
    return JSON.stringify({
      originalLength: draftText.length,
      platform,
      suggestions: [
        "Add a punchier hook in line 1 to capture immediate scroll attention.",
        "Use short bullet points to improve mobile readability.",
        "End with a clear, direct Call To Action (CTA) asking a question.",
      ],
    });
  },
  {
    name: "post_optimizer",
    description: "Analyzes draft social media text and provides actionable optimization recommendations for maximum engagement.",
    schema: z.object({
      draftText: z.string().describe("The draft post content to optimize"),
      platform: z.string().describe("Target platform (e.g. LinkedIn, Twitter/X, Instagram)"),
    }),
  }
);

export const saveMarkdownAssetTool = tool(
  async ({ title, content, tags }) => {
    const uploadDir = path.join(process.cwd(), "uploads", "assets");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanTitle = (title || "agent_response").trim().replace(/[^a-zA-Z0-9_\-\. ]/g, "");
    const finalName = cleanTitle.toLowerCase().endsWith(".md") ? cleanTitle : `${cleanTitle}.md`;
    const filename = `${uuidv4()}.md`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, content, "utf-8");
    const stats = fs.statSync(filePath);

    return JSON.stringify({
      success: true,
      message: `Markdown file saved to assets as '${finalName}'`,
      asset: {
        name: finalName,
        filename,
        size: stats.size,
        mimeType: "text/markdown",
        tags: tags || ["markdown", "agent-saved"],
      },
    });
  },
  {
    name: "save_markdown_asset",
    description: "Saves a markdown text response, post draft, strategy document, or article into user assets as a .md file.",
    schema: z.object({
      title: z.string().describe("Filename or title for the markdown document (e.g. content_strategy.md)"),
      content: z.string().describe("The full markdown formatted body content to save"),
      tags: z.array(z.string()).optional().describe("Optional list of tags for organizing the asset"),
    }),
  }
);

export const generateImageTool = tool(
  async ({ prompt, aspectRatio, title, tags }) => {
    return JSON.stringify({
      status: "pending_generation",
      prompt,
      aspectRatio: aspectRatio || "1:1",
      title: title || "generated_image",
      tags: tags || ["ai-generated", "chat-image"],
    });
  },
  {
    name: "generate_image",
    description: "Generates an AI image using Gemini model (gemini-3.1-flash-lite-image) from a detailed descriptive prompt, saves it to user assets, and presents it in chat.",
    schema: z.object({
      prompt: z.string().describe("Detailed descriptive prompt describing the image to generate"),
      aspectRatio: z.enum(["1:1", "16:9", "4:3", "3:4", "9:16"]).optional().describe("Aspect ratio for generated image (default 1:1)"),
      title: z.string().optional().describe("Name/title for saved image asset"),
      tags: z.array(z.string()).optional().describe("Optional tags to organize the image asset"),
    }),
  }
);

export const agentTools = [
  contentIdeaGeneratorTool,
  hashtagGeneratorTool,
  postOptimizerTool,
  saveMarkdownAssetTool,
  generateImageTool,
];


