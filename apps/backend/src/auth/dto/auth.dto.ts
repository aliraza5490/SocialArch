import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegistrationInput {
  @ApiProperty({
    example: "John",
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: "Doe",
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: "test@test.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "test123",
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class RequestResetPasswordInput {
  @ApiProperty({
    example: "test@test.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordInput {
  @ApiProperty({
    example: "test123",
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class ValidateEmailInput {
  @ApiProperty({
    example: "test@test.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class EmailVerificationInput {
  @ApiProperty({
    example: "test@test.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VerifyEmailInput {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class LoginInput {
  @ApiProperty({
    example: "test@test.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "test123",
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  rememberMe: boolean;
}
