import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class RegenerateMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  position: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  selectedVersions?: Record<number, number>;
}
