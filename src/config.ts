import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  Min,
  validateSync,
  IsString,
  IsEmail,
  IsPort,
} from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  PG_CONNECTION_STRING: string;

  @IsNumber()
  @Min(1)
  EMAIL_VERIFICATION_TOKEN_EXPIRATION: number;

  @IsNumber()
  @Min(1)
  REFRESH_TOKEN_EXPIRATION: number;

  @IsNumber()
  @Min(1)
  ACCESS_TOKEN_EXPIRATION: number;

  @IsNumber()
  @Min(1)
  RESET_PASSWORD_TOKEN_EXPIRATION: number;

  @IsString()
  MAIL_HOST: string;

  @IsPort()
  MAIL_PORT: string;

  @IsString()
  MAIL_USERNAME: string;

  @IsString()
  MAIL_PASSWORD: string;

  @IsEmail()
  SUPER_USER_EMAIL: string;

  @IsString()
  SUPER_USER_PASSWORD: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
