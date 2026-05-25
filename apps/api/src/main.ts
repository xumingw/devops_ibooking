import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupOpenApi } from './common/openapi';

export function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: true,
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );
  setupOpenApi(app);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(3000);
}

if (require.main === module) {
  void bootstrap();
}
