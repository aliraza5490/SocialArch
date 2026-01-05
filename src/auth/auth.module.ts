import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthToken } from "./entities/AuthToken.entity";
import { TokenService } from "./token.service";
import { User } from "./entities/User.entity";
import { AuthTokenSubscriber } from "./subscribers/AuthToken.subscriber";
import { AuthLogService } from "./AuthLog.service";
import LoginLog from "./entities/LoginLog.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthToken, User, LoginLog]),
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "defaultSecret",
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, AuthTokenSubscriber, AuthLogService],
})
export class AuthModule {}
