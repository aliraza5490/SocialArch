import { Module } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { AgentController } from "./agent.controller";
import { GeminiFileService } from "./gemini-file.service";
import { GeminiImageService } from "./gemini-image.service";
import { AssetsModule } from "@/assets/assets.module";

@Module({
  imports: [AssetsModule],
  controllers: [AgentController],
  providers: [AgentService, GeminiFileService, GeminiImageService],
  exports: [AgentService, GeminiFileService, GeminiImageService],
})
export class AgentModule {}

