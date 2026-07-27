import { tool } from "@langchain/core/tools";
import { z } from "zod";

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

export const agentTools = [
  contentIdeaGeneratorTool,
  hashtagGeneratorTool,
  postOptimizerTool,
];
