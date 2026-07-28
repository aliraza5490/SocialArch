import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { ChatService } from "./chat.service";
import { UpdateChatDto } from "./dto/update-chat.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { RegenerateMessageDto } from "./dto/regenerate-message.dto";
import { JWTUser } from "@/auth/decorators/jwtUser.decorator";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("chat")
@ApiBearerAuth()
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findAll(@JWTUser() user: any) {
    return this.chatService.findAll(user.ID);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @JWTUser() user: any) {
    return this.chatService.findOne(id, user.ID);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @JWTUser() user: any,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(id, user.ID, updateChatDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @JWTUser() user: any) {
    return this.chatService.remove(id, user.ID);
  }

  @Get(":id/messages")
  getMessages(@Param("id") id: string, @JWTUser() user: any) {
    return this.chatService.getMessageHistory(id, user.ID);
  }

  @Post("send")
  async send(
    @JWTUser() user: any,
    @Body() sendMessageDto: SendMessageDto,
    @Res() res: Response,
  ) {
    return this.chatService.createChatCompletion(
      sendMessageDto.chatId,
      user.ID,
      sendMessageDto.content || "",
      res,
      sendMessageDto.position,
      sendMessageDto.selectedVersions,
      sendMessageDto.newChat,
      sendMessageDto.attachments,
    );
  }

  @Post("regenerate")
  async regenerate(
    @JWTUser() user: any,
    @Body() regenerateMessageDto: RegenerateMessageDto,
    @Res() res: Response,
  ) {
    return this.chatService.regenerateResponse(
      regenerateMessageDto.chatId,
      user.ID,
      regenerateMessageDto.position,
      res,
      regenerateMessageDto.selectedVersions,
    );
  }
}
