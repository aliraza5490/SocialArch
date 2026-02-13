import { InvalidTokenException } from "@/shared/exceptions";
import { User } from "./entities/User.entity";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { AuthToken } from "./entities/AuthToken.entity";
import { AuthTokenType } from "./types";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthToken)
    private readonly authTokenRepository: Repository<AuthToken>,
  ) {}

  async signAuthTokens(user: User, rememberMe: boolean) {
    const tokens = {
      accessToken: "",
      refreshToken: "",
    };

    tokens.accessToken = this.signAccessToken(user);
    if (rememberMe) {
      tokens.refreshToken = await this.signRefreshToken(user);
    }

    return tokens;
  }

  signAccessToken(user: User) {
    const expiration = parseInt(
      this.configService.get<string>("ACCESS_TOKEN_EXPIRATION") || "1800",
      10,
    );
    return this.jwtService.sign(
      { email: user.email, ID: user.ID },
      {
        expiresIn: expiration,
      },
    );
  }

  async signRefreshToken(user: User) {
    const expiration = parseInt(
      this.configService.get<string>("REFRESH_TOKEN_EXPIRATION") || "604800",
      10,
    );
    const token = this.jwtService.sign(
      { ID: user.ID },
      {
        expiresIn: expiration,
      },
    );

    await this.authTokenRepository.save(
      this.authTokenRepository.create({
        identifier: user.ID,
        token,
        type: AuthTokenType.refreshToken,
        TTL: new Date(Date.now() + expiration * 1000),
      }),
    );

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    let decoded;
    try {
      decoded = this.jwtService.verify(refreshToken);
    } catch {
      throw new InvalidTokenException("Invalid or expired refresh token");
    }

    const storedToken = await this.authTokenRepository.findOne({
      where: {
        identifier: decoded.ID,
        token: refreshToken,
        type: AuthTokenType.refreshToken,
      },
    });

    if (!storedToken) {
      throw new InvalidTokenException("Invalid refresh token");
    }

    const isExpired = storedToken.TTL <= new Date();
    if (isExpired) {
      await this.authTokenRepository.remove(storedToken);
      throw new InvalidTokenException("Refresh token expired");
    }

    const user = await this.userRepository.findOne({
      where: { ID: decoded.ID },
    });

    if (!user) {
      await this.authTokenRepository.remove(storedToken);
      throw new NotFoundException("User not found");
    }

    if (!user.isEmailVerified) {
      await this.authTokenRepository.remove(storedToken);
      throw new ForbiddenException("Email not verified");
    }

    await this.authTokenRepository.remove(storedToken);

    return {
      accessToken: this.signAccessToken(user),
      refreshToken: await this.signRefreshToken(user),
    };
  }

  async signResetPasswordToken(email: string) {
    const token = this.jwtService.sign(
      { email },
      {
        expiresIn: `${this.configService.get("RESET_PASSWORD_TOKEN_EXPIRATION")}s`,
      },
    );
    await this.authTokenRepository.save(
      this.authTokenRepository.create({
        identifier: email,
        token,
        type: AuthTokenType.resetPassword,
        TTL: new Date(
          Date.now() +
            this.configService.get("RESET_PASSWORD_TOKEN_EXPIRATION") * 1000,
        ),
      }),
    );

    return token;
  }

  async verifyResetPasswordToken(token: string) {
    const decodedToken = await this.jwtService.decode(token);
    if (!decodedToken || !decodedToken.email) {
      throw new InvalidTokenException();
    }

    const storedToken = await this.authTokenRepository.findOne({
      where: {
        identifier: decodedToken.email,
        token,
        type: AuthTokenType.resetPassword,
        TTL: MoreThan(new Date()),
      },
    });
    if (!storedToken) {
      throw new InvalidTokenException("Token not found/expired");
    }

    await this.authTokenRepository.delete({
      type: AuthTokenType.resetPassword,
      identifier: decodedToken.email,
      token,
    });

    return decodedToken.email;
  }

  async signEmailVerificationToken(email: string) {
    const token = this.jwtService.sign(
      { email },
      {
        expiresIn: `${this.configService.get("EMAIL_VERIFICATION_TOKEN_EXPIRATION")}s`,
      },
    );

    await this.authTokenRepository.save(
      this.authTokenRepository.create({
        identifier: email,
        token,
        type: AuthTokenType.emailVerification,
        TTL: new Date(
          Date.now() +
            this.configService.get("EMAIL_VERIFICATION_TOKEN_EXPIRATION") *
              1000,
        ),
      }),
    );

    return token;
  }

  async verifyEmailVerificationToken(token: string): Promise<string> {
    let decodedToken;
    try {
      decodedToken = this.jwtService.verify(token);
    } catch {
      throw new InvalidTokenException("Token not found/expired");
    }

    if (!decodedToken || !decodedToken.email) {
      throw new InvalidTokenException();
    }

    const storedToken = await this.authTokenRepository.findOne({
      where: {
        identifier: decodedToken.email,
        token,
        type: AuthTokenType.emailVerification,
        TTL: MoreThan(new Date()),
      },
    });

    if (!storedToken) {
      throw new InvalidTokenException("Token not found/expired");
    }

    await storedToken.remove();

    return decodedToken.email;
  }
}
