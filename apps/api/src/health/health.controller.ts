import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponse } from '@ibooking/shared-types';
import { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('api/v1/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ description: 'API health status' })
  async getHealth(@Res({ passthrough: true }) response: Response): Promise<HealthResponse> {
    const health = await this.healthService.getHealth();
    if (health.status === 'DOWN') response.status(503);
    return health;
  }
}
