import { Injectable } from '@nestjs/common';
import { HealthResponse } from '@ibooking/shared-types';

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: 'UP',
      db: 'UP',
      redis: 'UP',
      timestamp: new Date().toISOString()
    };
  }
}
