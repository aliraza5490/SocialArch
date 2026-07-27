import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable } from "rxjs";
import { Request } from "express";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const env =
      this.configService.get<string>("NODE_ENV") || process.env.NODE_ENV;
    if (env !== "production") {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.connection.remoteAddress || "unknown";

    const rateLimitedRoutes = [
      "/auth/register",
      "/auth/login",
      "/auth/request-reset-password",
    ];
    const path = request.path;

    if (!rateLimitedRoutes.some((route) => path.includes(route))) {
      return next.handle();
    }

    const now = Date.now();
    const cacheKey = `rate_limit_interceptor:${ip}:${path}`;
    const record = await this.cacheManager.get<RateLimitRecord>(cacheKey);

    if (!record || now > record.resetTime) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      await this.cacheManager.set(cacheKey, newRecord, this.windowMs);
      return next.handle();
    }

    record.count++;
    await this.cacheManager.set(cacheKey, record, this.windowMs);

    if (record.count > this.maxAttempts) {
      throw new HttpException(
        `Too many requests from ${ip}. Try again after ${new Date(record.resetTime).toISOString()}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }
}
