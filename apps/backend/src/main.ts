import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter, NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import express, { Request, Response } from "express";
import { AppModule } from "../src/app.module";

const server = express();
let initialized = false;

async function bootstrap(): Promise<void> {
  if (initialized) {
    return;
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );

  const configService = app.get(ConfigService);
  const logger = new Logger("Vercel");

  // Your existing middleware/configuration...

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigin = configService.get<string>("FRONTEND_URL");

      if (!allowedOrigin) {
        logger.error("FRONTEND_URL is not configured");

        return callback(
          new BadRequestException(
            "Server misconfiguration: FRONTEND_URL not set",
          ),
        );
      }

      if (!origin || allowedOrigin.includes(origin)) {
        return callback(null, true);
      }

      return callback(new BadRequestException("Not allowed by CORS"));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("SocialArch API")
    .setDescription("SocialArch API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    "docs",
    app,
    () => SwaggerModule.createDocument(app, config),
  );

  await app.init();

  initialized = true;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  await bootstrap();
  server(req, res);
}