import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindManyOptions } from "typeorm";
import LoginLog from "./entities/LoginLog.entity";

@Injectable()
export class AuthLogService {
  constructor(
    @InjectRepository(LoginLog)
    private readonly loginLogRepository: Repository<LoginLog>,
  ) {}

  /**
   * Create and persist a login log entry.
   */
  async create(ip: string, existingLog: LoginLog | null): Promise<LoginLog> {
    if (existingLog) {
      existingLog.retries += 1;
      if (existingLog.retries >= 5) {
        existingLog.blockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Block for 15 minutes
      }
      return this.loginLogRepository.save(existingLog);
    }
    const log = this.loginLogRepository.create({
      ip,
      retries: 1,
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
   * Find a single log by IP.
   */
  async findOneByIP(ip: string): Promise<LoginLog | null> {
    return this.loginLogRepository.findOne({
      where: { ip },
    });
  }

  /**
   * Reset a log entry by IP after a successful login.
   */
  async resetByIP(ip: string, existingLog: LoginLog | null): Promise<void> {
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
