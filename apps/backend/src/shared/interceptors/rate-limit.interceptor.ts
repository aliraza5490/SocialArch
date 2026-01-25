import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private store: RateLimitStore = {};
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.connection.remoteAddress || "unknown";

    // Only rate limit specific endpoints
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
    const record = this.store[ip];

    if (!record || now > record.resetTime) {
      this.store[ip] = { count: 1, resetTime: now + this.windowMs };
      return next.handle();
    }

    record.count++;

    if (record.count > this.maxAttempts) {
      throw new HttpException(
        `Too many requests from ${ip}. Try again after ${new Date(record.resetTime).toISOString()}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }
}
