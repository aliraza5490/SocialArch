import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { Keyv } from "keyv";
import { KeyvCacheableMemory } from "cacheable";
import KeyvRedis from "@keyv/redis";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthGuard } from "@/auth/guards/auth.guard";
import { RateLimitGuard } from "@/auth/guards/rate-limit.guard";
import { AuthModule } from "./auth/auth.module";
import { SharedModule } from "./shared/shared.module";
import { ChatModule } from "./chat/chat.module";
import { AgentModule } from "./agent/agent.module";
import { MailModule } from "./mail/mail.module";
import { AssetsModule } from "./assets/assets.module";
import { validate } from "./config";
import { RateLimitInterceptor } from "@/shared/interceptors/rate-limit.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        ".env",
        ".env.local",
        "apps/backend/.env",
        "apps/backend/.env.local",
      ],
      validate: validate,
    }),
    JwtModule.register({}),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("PG_CONNECTION_STRING"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get("NODE_ENV") == "development",
        migrations: [__dirname + "/migrations/*.{ts,js}"],
        migrationsRun: false,
        logging: configService.get("NODE_ENV") !== "production",
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          new Keyv({
            store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }),
          }),
          new KeyvRedis(
            configService.get<string>("REDIS_URL") ?? "redis://localhost:6379",
          ),
        ],
      }),
      inject: [ConfigService],
    }),
    MailModule,
    AuthModule,
    SharedModule,
    ChatModule,
    AgentModule,
    AssetsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
  ],
})
export class AppModule { }
