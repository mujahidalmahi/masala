import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port')!;
  const host = configService.get<string>('host')!;
  const corsOrigin = configService.get<string>('cors.origin')!;

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o: string) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.setGlobalPrefix('api', { exclude: ['api/health'] });

  app.enableShutdownHooks();

  await app.listen(port, host);

  logger.log(`Server running on http://${host}:${port}`);
  logger.log(`Health check: http://${host}:${port}/api/health`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((err: Error) => {
  Logger.error('Failed to start server', err.stack, 'Bootstrap');
  process.exit(1);
});
