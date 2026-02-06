import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateChatDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
