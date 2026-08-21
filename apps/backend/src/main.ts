import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const logger = new Logger("NestApp");

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

  app.use(compression());

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

  SwaggerModule.setup("docs", app, () =>
    SwaggerModule.createDocument(app, config),
  );

  const port = configService.get<number>("PORT") ?? process.env.PORT ?? 8000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/docs`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

