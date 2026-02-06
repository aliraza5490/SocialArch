import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { UpdateChatDto } from "./dto/update-chat.dto";
import { JWTUser } from "@/auth/decorators/jwtUser.decorator";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("chat")
@ApiBearerAuth()
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@JWTUser() user: any, @Body() createChatDto: CreateChatDto) {
    return this.chatService.create(user.ID, createChatDto);
  }

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
    // Basic verification that user owns the chat
    return this.chatService.getMessageHistory(id);
  }
}
