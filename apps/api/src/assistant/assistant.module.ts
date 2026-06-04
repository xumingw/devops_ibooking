import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { AssistantController } from './assistant.controller';
import {
  ASSISTANT_MODEL_CLIENT,
  ASSISTANT_REPOSITORY,
  AssistantService
} from './assistant.service';
import { DeepSeekAssistantClient } from './deepseek-assistant.client';
import { PrismaAssistantRepository } from './prisma-assistant.repository';

@Module({
  imports: [AuthModule],
  controllers: [AssistantController],
  providers: [
    PrismaService,
    AssistantService,
    DeepSeekAssistantClient,
    PrismaAssistantRepository,
    {
      provide: ASSISTANT_REPOSITORY,
      useExisting: PrismaAssistantRepository
    },
    {
      provide: ASSISTANT_MODEL_CLIENT,
      useExisting: DeepSeekAssistantClient
    }
  ]
})
export class AssistantModule {}
