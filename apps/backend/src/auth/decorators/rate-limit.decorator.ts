import { SetMetadata } from "@nestjs/common";

export const RateLimit = (enable: boolean = true) =>
  SetMetadata("rateLimit", enable);
