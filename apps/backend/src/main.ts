import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as compression from "compression";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const logger = new Logger("Main");
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigin = configService.get<string>("FRONTEND_URL");
      if (!origin || !allowedOrigin) {
        return callback(null, true);
      }
      if (allowedOrigin.indexOf(origin) === -1) {
        logger.warn(`CORS request from disallowed origin: ${origin}`);
        return callback(new BadRequestException("Not allowed by CORS"));
      }
      return callback(null, true);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("NestJS Template")
    .setDescription("The API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}/docs`,
  );
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
