import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, Transporter } from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import {
  IResetPasswordMail,
  IResetPasswordSuccessMail,
  IVerificationMail,
} from "../shared/shared.types";

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT") || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>("MAIL_USERNAME"),
        pass: this.configService.get<string>("MAIL_PASSWORD"),
      },
    });
  }

  private loadTemplate(templateFileName: string, replacements: Record<string, string>): string {
    const templatePath = path.join(__dirname, "templates", templateFileName);
    let html = fs.readFileSync(templatePath, "utf-8");
    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value || "");
    }
    return html;
  }

  async sendResetPasswordMail(input: IResetPasswordMail) {
    try {
      const frontendUrl = this.configService.get<string>("FRONTEND_URL");
      const resetUrl = `${frontendUrl}/reset-password?token=${input.token}`;
      const html = this.loadTemplate("reset-password.html", { resetUrl });

      await this.transporter.sendMail({
        from: this.configService.get<string>("MAIL_FROM_ADDRESS"),
        to: input.email,
        subject: "Reset Password",
        html,
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async sendResetPasswordSuccessMail(input: IResetPasswordSuccessMail) {
    const html = this.loadTemplate("reset-password-success.html", {
      firstName: input.firstName,
    });

    await this.transporter.sendMail({
      from: this.configService.get<string>("MAIL_FROM_ADDRESS"),
      to: input.email,
      subject: "Reset Password",
      html,
    });
  }

  async sendVerificationMail(input: IVerificationMail) {
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    const verifyUrl = `${frontendUrl}/verify-email?token=${input.token}`;
    const html = this.loadTemplate("verify-email.html", {
      firstName: input.firstName,
      verifyUrl,
    });

    await this.transporter.sendMail({
      from: this.configService.get<string>("MAIL_FROM_ADDRESS"),
      to: input.email,
      subject: "Verify Your Email",
      html,
    });
  }
}
