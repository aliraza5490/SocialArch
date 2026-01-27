import { Injectable } from "@nestjs/common";
import { JWTPayload } from "./shared/types";

@Injectable()
export class AppService {
  getHello(JWTPayload?: JWTPayload): string {
    return JWTPayload
      ? `Hello ${JWTPayload.email || "stranger"}!`
      : "Hello World!";
  }
}
