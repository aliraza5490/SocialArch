import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as fs from "fs";
import { normalizeMimeType, isGeminiSupportedMimeType } from "@/common/utils/mime-utils";

export interface GeminiFileResult {
  fileUri: string;
  mimeType: string;
  name: string;
}

@Injectable()
export class GeminiFileService {
  private readonly logger = new Logger(GeminiFileService.name);
  private fileManager: GoogleAIFileManager | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (apiKey) {
      this.fileManager = new GoogleAIFileManager(apiKey);
    }
  }

  async uploadFileToGemini(
    filePath: string,
    mimeType: string,
    displayName?: string,
  ): Promise<GeminiFileResult | null> {
    if (!this.fileManager) {
      this.logger.warn("GoogleAIFileManager not initialized (missing API key)");
      return null;
    }

    if (!filePath || !fs.existsSync(filePath)) {
      this.logger.warn(`File not found on disk: ${filePath}`);
      return null;
    }

    const normalizedMime = normalizeMimeType(filePath || displayName, mimeType);

    if (!isGeminiSupportedMimeType(normalizedMime)) {
      this.logger.warn(
        `Unsupported MIME type for Gemini File API: ${normalizedMime} (${displayName}). Skipping Gemini File upload.`,
      );
      return null;
    }

    try {
      this.logger.log(`Uploading file to Gemini File API: ${filePath} (${normalizedMime})`);
      const uploadResult = await this.fileManager.uploadFile(filePath, {
        mimeType: normalizedMime,
        displayName: displayName || "Uploaded Asset",
      });

      this.logger.log(`File uploaded to Gemini. URI: ${uploadResult.file.uri}`);
      return {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType || normalizedMime,
        name: uploadResult.file.name,
      };
    } catch (error) {
      this.logger.error("Failed to upload file to Gemini File API:", error);
      return null;
    }
  }
}
