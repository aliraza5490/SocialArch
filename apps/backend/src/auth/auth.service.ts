import { comparePassword, generatePasswordHash } from "@/shared/utils/bcrypt";
import { MailService } from "@/shared/mail/mail.service";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import {
  EmailVerificationInput,
  LoginInput,
  RegistrationInput,
  RequestResetPasswordInput,
  ResetPasswordInput,
  ValidateEmailInput,
  VerifyEmailInput,
} from "./dto/auth.dto";
import { TokenService } from "./token.service";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/User.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { AuthLogService } from "./AuthLog.service";

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly logService: AuthLogService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    // Module initialization logic here if needed
  }

  async register(input: RegistrationInput) {
    const userExist = await this.userRepository.findOne({
      where: { email: input.email },
    });
    if (userExist && userExist.isEmailVerified) {
      throw new ConflictException("Email already in use");
    }

    // Delete only if previous registration is older than 24 hours
    if (userExist && !userExist.isEmailVerified) {
      const createdAt = new Date(userExist.createdAt);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        await this.userRepository.delete({ email: input.email });
      } else {
        throw new ConflictException(
          "Email already registered. Please check your mailbox or request a new verification link.",
        );
      }
    }

    const hashedPassword = await generatePasswordHash(input.password);
    const user = this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    });
    await this.userRepository.save(user);

    const emailVerificationToken =
      await this.tokenService.signEmailVerificationToken(user.email);
    await this.mailService.sendVerificationMail({
      email: user.email,
      firstName: user.firstName,
      token: emailVerificationToken,
    });
  }

  async login(input: LoginInput, ip: string) {
    const loginLog = await this.logService.findOneByIP(ip);

    if (loginLog && loginLog.blockedUntil > new Date()) {
      throw new ForbiddenException(
        `Too many failed login attempts. Try again after ${loginLog.blockedUntil.toISOString()}`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (!user) {
      await this.logService.create(ip, loginLog);
      throw new UnauthorizedException("Invalid Credentials");
    }

    if (!user.isEmailVerified) {
      await this.logService.create(ip, loginLog);
      throw new ForbiddenException("Email not verified");
    }

    const { password, ...userWithoutPassword } = user;

    if (!(await comparePassword(password, input.password))) {
      await this.logService.create(ip, loginLog);
      throw new UnauthorizedException("Invalid Credentials");
    }

    await this.logService.resetByIP(ip, loginLog);

    const tokens = await this.tokenService.signAuthTokens(
      user,
      input.rememberMe,
    );

    return { ...tokens, user: userWithoutPassword };
  }

  async requestResetPassword(input: RequestResetPasswordInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const token = await this.tokenService.signResetPasswordToken(input.email);
    await this.mailService.sendResetPasswordMail({
      email: input.email,
      firstName: user.firstName,
      token,
    });
  }

  async resetPassword(input: ResetPasswordInput) {
    const email = await this.tokenService.verifyResetPasswordToken(input.token);
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.password = await generatePasswordHash(input.password);
    await this.userRepository.save(user);

    await this.mailService.sendResetPasswordSuccessMail({
      email,
      firstName: user.firstName,
    });
  }

  async validateEmail(input: ValidateEmailInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });

    return { exist: !!user };
  }

  async verifyEmail(input: VerifyEmailInput) {
    const email = await this.tokenService.verifyEmailVerificationToken(
      input.token,
    );
    await this.userRepository.update({ email }, { isEmailVerified: true });

    return { message: "Congratulation, your email verified successfully" };
  }

  async sendEmailVerification(input: EmailVerificationInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.isEmailVerified) {
      throw new BadRequestException("Email already verified");
    }

    const token = await this.tokenService.signEmailVerificationToken(
      user.email,
    );

    await this.mailService.sendVerificationMail({
      email: user.email,
      firstName: user.firstName,
      token,
    });
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { ID: id },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
