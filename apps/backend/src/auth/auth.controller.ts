import { Body, Controller, Get, Ip, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  EmailVerificationInput,
  LoginInput,
  RegistrationInput,
  RequestResetPasswordInput,
  ResetPasswordInput,
  ValidateEmailInput,
  VerifyEmailInput,
} from "./dto/auth.dto";
import { Public } from "./decorators/public.decorator";
import { JWTUser } from "./decorators/jwtUser.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() input: RegistrationInput) {
    await this.authService.register(input);

    return { message: "Check your mailbox to verify email" };
  }

  @Public()
  @Post("login")
  async login(@Body() loginDto: LoginInput, @Ip() ip: string) {
    return this.authService.login(loginDto, ip);
  }

  @Public()
  @Get("request-reset-password")
  async requestResetPassword(@Query() input: RequestResetPasswordInput) {
    await this.authService.requestResetPassword(input);

    return { message: "Check your mailbox" };
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() input: ResetPasswordInput) {
    await this.authService.resetPassword(input);
    return { message: "Password reset successfully" };
  }

  @Public()
  @Get("validate-email")
  async validateEmail(@Query() input: ValidateEmailInput) {
    return this.authService.validateEmail(input);
  }

  @Public()
  @Get("verify-email")
  async verifyEmail(@Query() input: VerifyEmailInput) {
    return this.authService.verifyEmail(input);
  }

  @Public()
  @Get("send-email-verification")
  async sendEmailVerification(@Query() input: EmailVerificationInput) {
    await this.authService.sendEmailVerification(input);

    return { message: "Check your mailbox to verify email" };
  }

  @Get("me")
  async getCurrentUser(@JWTUser() user: any) {
    return this.authService.getUserById(user.ID);
  }
}
