import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

export interface GeneratedImageResult {
  buffer: Buffer;
  mimeType: string;
}

@Injectable()
export class GeminiImageService {
  private readonly logger = new Logger(GeminiImageService.name);

  constructor(private configService: ConfigService) {}

  async generateGeminiImage(
    prompt: string,
    aspectRatio?: string,
  ): Promise<GeneratedImageResult> {
    const geminiApiKey =
      this.configService.get<string>("GEMINI_API_KEY") || "";

    this.logger.log(
      "Generating image with GoogleGenAI interaction (models/gemini-3.1-flash-lite-image)...",
    );
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
    });

    const generationConfig = {
      temperature: 1,
      max_output_tokens: 65536,
      thinking_level: "low",
    };

    try {
      const interaction = await (ai as any).interactions.create({
        model: "models/gemini-3.1-flash-lite-image",
        input: [
          {
            type: "text",
            text: prompt,
          },
        ],
        generation_config: generationConfig,
        response_modalities: ["image", "text"],
      });

      if (interaction?.steps) {
        for (const step of interaction.steps) {
          if (step.type === "model_output" && step.content) {
            for (const part of step.content) {
              if (part.type === "image" && part.data) {
                this.logger.log(
                  "Successfully generated image via GoogleGenAI interactions!",
                );
                return {
                  buffer: Buffer.from(part.data, "base64"),
                  mimeType: "image/png",
                };
              }
            }
          }
        }
      }

      throw new Error("No image data returned from GoogleGenAI interaction");
    } catch (sdkErr: any) {
      this.logger.error(
        `GoogleGenAI interaction call failed: ${sdkErr.message}`,
        sdkErr.stack,
      );
      throw sdkErr;
    }
  }
}
