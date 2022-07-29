import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { NotFoundInterceptor } from './core/interceptors/NotFoundInterceptor/NotFoundInterceptor';
import { LoggingInterceptor } from './core/interceptors/LoggerInterceptor/LoggerInterceptor';

import { AppModule } from './app.module';

const start = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const config = await app.get(ConfigService);
  const port = config.get<number>('API_PORT') || 5000;

  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new NotFoundInterceptor());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port, () => console.log(`Server started on port: ${port}`));
};

start();
