import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';
import * as express from 'express';
import * as path from 'path';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Desinfec-Backend')
    .setDescription('Documentação da API do projeto Desinfec-Backend')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Documentação da API',
  };
  app.use('/api-docs', express.static(path.join(__dirname, 'public')));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document, options));

  await app.listen(3006);
}
bootstrap();
