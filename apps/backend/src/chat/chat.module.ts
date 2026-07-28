import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "./entities/Chat.entity";
import { Message } from "./entities/Message.entity";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { AgentModule } from "@/agent/agent.module";
import { AssetsModule } from "@/assets/assets.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message]),
    AgentModule,
    AssetsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}

