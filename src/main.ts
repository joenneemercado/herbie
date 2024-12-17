import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { QueueModule } from './queue/queue.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Hebie CDP API')
    .setDescription('API para gerenciar customer (CDP)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));
  app.enableCors();

  // Agora registramos o Bull Board explicitamente após a inicialização
  const queueModule = app.select(AppModule).get(QueueModule);
  queueModule.setupBullBoard(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: false, // Lança erro se houver propriedades não permitidas
      transform: true, // Transforma tipos automaticamente
    }),
  );
  //app.useGlobalGuards(new RolesGuard()); // Aplica o guard globalmente

  await app.listen(process.env.PORT || 3000, async () => {
    console.log(`Application is running on: ${await app.getUrl()}`);
  });
}

bootstrap();
