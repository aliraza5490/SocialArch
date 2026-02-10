import { Controller, Post, Body, Res } from "@nestjs/common";
import { Response } from "express";
import { AiService } from "./ai.service";
import { JWTUser } from "@/auth/decorators/jwtUser.decorator";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("ai")
@ApiBearerAuth()
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("chat")
  async chat(
    @JWTUser() user: any,
    @Body("chatId") chatId: string,
    @Body("content") content: string,
    @Res() res: Response,
    @Body("position") position?: number,
    @Body("selectedVersions") selectedVersions?: Record<number, number>,
  ) {
    return this.aiService.createChatCompletion(chatId, user.ID, content, res, position, selectedVersions);
  }

  @Post("regenerate")
  async regenerate(
    @JWTUser() user: any,
    @Body("chatId") chatId: string,
    @Body("position") position: number,
    @Body("selectedVersions") selectedVersions: Record<number, number>,
    @Res() res: Response,
  ) {
    return this.aiService.regenerateResponse(chatId, user.ID, position, res, selectedVersions);
  }
}
