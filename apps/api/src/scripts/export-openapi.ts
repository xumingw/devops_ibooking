import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { createOpenApiDocument } from '../common/openapi';
import { configureApp } from '../main';

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  configureApp(app);
  await app.init();

  const document = createOpenApiDocument(app);
  const output = resolve(__dirname, '../../../../docs/api/openapi.yaml');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
}

void exportOpenApi();
