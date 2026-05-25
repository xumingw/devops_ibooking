import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Fudan Study Room Booking API')
    .setDescription('I0 API scaffold for the study-room booking system')
    .setVersion('0.1.0')
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupOpenApi(app: INestApplication): void {
  SwaggerModule.setup('/api/docs', app, createOpenApiDocument(app));
}
