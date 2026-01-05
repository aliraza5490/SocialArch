import { Injectable } from "@nestjs/common";
import { JWTPayload } from "./shared/types";

@Injectable()
export class AppService {
  getHello(JWTPayload?: JWTPayload): string {
    return JWTPayload
      ? `Hello ${JWTPayload.id ? JWTPayload.role : "stranger"}!`
      : "Hello World!";
  }
}
