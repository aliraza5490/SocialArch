import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000;

  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const enableRateLimit = this.reflector.getAllAndOverride<boolean>(
      "rateLimit",
      [context.getHandler(), context.getClass()],
    );

    if (enableRateLimit === false) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.connection.remoteAddress || "unknown";
    const path = request.path;

    const rateLimitedRoutes = [
      "/auth/register",
      "/auth/login",
      "/auth/request-reset-password",
      "/auth/reset-password",
    ];

    if (!rateLimitedRoutes.some((route) => path.includes(route))) {
      return true;
    }

    const now = Date.now();
    const cacheKey = `rate_limit:${ip}:${path}`;
    const record = await this.cacheManager.get<RateLimitRecord>(cacheKey);

    if (!record || now > record.resetTime) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      await this.cacheManager.set(cacheKey, newRecord, this.windowMs);
      return true;
    }

    record.count++;
    await this.cacheManager.set(cacheKey, record, this.windowMs);

    if (record.count > this.maxAttempts) {
      this.logger.warn(
        `Rate limit exceeded for IP: ${ip}. Attempts: ${record.count}`,
      );
      throw new ForbiddenException(
        `Too many requests. Try again after ${new Date(record.resetTime).toISOString()}`,
      );
    }

    return true;
  }
}
