import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindManyOptions } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import LoginLog from "./entities/LoginLog.entity";

interface LoginAttemptCache {
  retries: number;
  blockedUntil?: number;
  lastLogin?: number;
}

@Injectable()
export class AuthLogService {
  private readonly cacheKeyPrefix = "auth_log:";
  private readonly blockDurationMs = 15 * 60 * 1000;
  private readonly maxRetries = 5;
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(LoginLog)
    private readonly loginLogRepository: Repository<LoginLog>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Create and persist a login log entry.
   */
  async create(ip: string, existingLog: LoginLog | null): Promise<LoginLog> {
    const cacheKey = `${this.cacheKeyPrefix}${ip}`;
    const cached = await this.cacheManager.get<LoginAttemptCache>(cacheKey);

    const retries = (cached?.retries || existingLog?.retries || 0) + 1;
    let blockedUntil: Date | undefined;

    if (retries >= this.maxRetries) {
      blockedUntil = new Date(Date.now() + this.blockDurationMs);
    }

    const cacheData: LoginAttemptCache = {
      retries,
      blockedUntil: blockedUntil?.getTime(),
      lastLogin: cached?.lastLogin,
    };
    await this.cacheManager.set(cacheKey, cacheData, this.cacheTtlMs);

    if (existingLog) {
      existingLog.retries = retries;
      if (blockedUntil) {
        existingLog.blockedUntil = blockedUntil;
      }
      return this.loginLogRepository.save(existingLog);
    }

    const log = this.loginLogRepository.create({
      ip,
      retries,
      blockedUntil,
    });
    return this.loginLogRepository.save(log);
  }

  /**
   * Find logs with an optional filter and pagination.
   * Returns data and total count.
   */
  async find(
    filter: Partial<LoginLog> = {},
    options: Pick<FindManyOptions<LoginLog>, "skip" | "take" | "order"> = {
      skip: 0,
      take: 50,
      order: { createdAt: "DESC" } as any,
    },
  ): Promise<{ data: LoginLog[]; count: number }> {
    const [data, count] = await this.loginLogRepository.findAndCount({
      where: filter as any,
      ...options,
    });
    return { data, count };
  }

  /**
   * Find a single log by IP - checks cache first, then database.
   */
  async findOneByIP(ip: string): Promise<LoginLog | null> {
    const cacheKey = `${this.cacheKeyPrefix}${ip}`;
    const cached = await this.cacheManager.get<LoginAttemptCache>(cacheKey);

    if (cached) {
      const now = Date.now();
      if (cached.blockedUntil && cached.blockedUntil > now) {
        const log = new LoginLog();
        log.ip = ip;
        log.retries = cached.retries;
        log.blockedUntil = new Date(cached.blockedUntil);
        if (cached.lastLogin) {
          log.lastLogin = new Date(cached.lastLogin);
        }
        return log;
      }
    }

    return this.loginLogRepository.findOne({
      where: { ip },
    });
  }

  /**
   * Check if an IP is currently blocked - uses cache for performance.
   */
  async isBlocked(
    ip: string,
  ): Promise<{ blocked: boolean; retryAfter?: number }> {
    const cacheKey = `${this.cacheKeyPrefix}${ip}`;
    const cached = await this.cacheManager.get<LoginAttemptCache>(cacheKey);

    if (cached?.blockedUntil) {
      const now = Date.now();
      if (cached.blockedUntil > now) {
        return {
          blocked: true,
          retryAfter: Math.ceil((cached.blockedUntil - now) / 1000),
        };
      }
    }

    const log = await this.loginLogRepository.findOne({
      where: { ip },
    });

    if (log?.blockedUntil && log.blockedUntil > new Date()) {
      const retryAfter = Math.ceil(
        (log.blockedUntil.getTime() - Date.now()) / 1000,
      );
      return { blocked: true, retryAfter };
    }

    return { blocked: false };
  }

  /**
   * Reset a log entry by IP after a successful login.
   */
  async resetByIP(ip: string, existingLog: LoginLog | null): Promise<void> {
    const cacheKey = `${this.cacheKeyPrefix}${ip}`;
    const cacheData: LoginAttemptCache = {
      retries: 0,
      lastLogin: Date.now(),
    };
    await this.cacheManager.set(cacheKey, cacheData, this.cacheTtlMs);

    if (existingLog) {
      await this.loginLogRepository.update(
        { ip },
        { retries: 0, lastLogin: new Date() },
      );
    } else {
      const log = this.loginLogRepository.create({
        ip,
        retries: 0,
        lastLogin: new Date(),
      });
      await this.loginLogRepository.save(log);
    }
  }
}
