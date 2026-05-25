import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponse } from '@ibooking/shared-types';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('api/v1/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ description: 'API health status' })
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }
}
