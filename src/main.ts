import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { QueueModule } from './queue/queue.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
// Importar módulos públicos
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Documentação EXTERNA (pública)
  const publicConfig = new DocumentBuilder()
    .setTitle('API Pública - Herbie')
    .setDescription('Documentação para clientes e parceiros')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const publicDocument = SwaggerModule.createDocument(app, publicConfig, {
    include: [AuthModule, ProductsModule],
  });
  SwaggerModule.setup('docs/public', app, publicDocument);

  // Documentação INTERNA (completa)
  const internalConfig = new DocumentBuilder()
    .setTitle('API Interna - Herbie')
    .setDescription('Documentação completa para desenvolvedores')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const internalDocument = SwaggerModule.createDocument(app, internalConfig);

  // Proteção básica para documentação interna
  app.use(
    '/docs/internal',
    basicAuth({
      users: { dev: 'dev@123' },
      challenge: true,
    }),
  );
  SwaggerModule.setup('docs/internal', app, internalDocument);

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));
  app.enableCors();

  // Bull Board e pipes globais (como já está)
  //const queueModule = app.select(AppModule).get(QueueModule);
  //queueModule.setupBullBoard(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000, async () => {
    console.log(`App is running on: ${await app.getUrl()}`);
  });
}

bootstrap();
