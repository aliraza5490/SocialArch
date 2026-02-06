import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { ChatModule } from "@/chat/chat.module";

@Module({
  imports: [ChatModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
