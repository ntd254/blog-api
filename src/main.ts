import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors();
  app.useBodyParser('json', { limit: '10mb' });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configDocApi = new DocumentBuilder()
    .setTitle('Blog API')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, configDocApi);
  SwaggerModule.setup('docs', app, document);
  await app.listen(configService.get('PORT'));
}

bootstrap();
