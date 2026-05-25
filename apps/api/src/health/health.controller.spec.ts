// @story US0.2.1
// @tc TC-US0.2.1-01
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('返回 I0 健康检查数据，不在 controller 内包装统一响应', () => {
    const timestamp = '2026-04-28T00:00:00.000Z';
    const service: Pick<HealthService, 'getHealth'> = {
      getHealth: () => ({ status: 'UP', db: 'UP', redis: 'UP', timestamp })
    };

    const controller = new HealthController(service as HealthService);

    expect(controller.getHealth()).toEqual({
      status: 'UP',
      db: 'UP',
      redis: 'UP',
      timestamp
    });
  });

  it('可通过 Nest testing module 注入 HealthService', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService]
    }).compile();

    const controller = moduleRef.get(HealthController);
    expect(controller.getHealth().status).toBe('UP');
  });
});
