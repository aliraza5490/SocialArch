import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class SendMessageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  newChat?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  selectedVersions?: Record<number, number>;
}
