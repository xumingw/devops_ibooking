// @story US0.2.1
// @tc TC-US0.2.1-01
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthController } from '../../../src/health/health.controller';
import { HealthService } from '../../../src/health/health.service';
import { PrismaService } from '../../../src/database/prisma.service';

describe('HealthController', () => {
  it('返回 I0 健康检查数据，不在 controller 内包装统一响应', async () => {
    const timestamp = '2026-04-28T00:00:00.000Z';
    const service: Pick<HealthService, 'getHealth'> = {
      getHealth: () => Promise.resolve({ status: 'UP', db: 'UP', redis: 'UP', timestamp })
    };
    const response = { status: jest.fn() };

    const controller = new HealthController(service as HealthService);

    await expect(controller.getHealth(response as never)).resolves.toEqual({
      status: 'UP',
      db: 'UP',
      redis: 'UP',
      timestamp
    });
    expect(response.status).not.toHaveBeenCalled();
  });

  it('依赖不可用时设置 503，让 curl -f 部署门禁失败', async () => {
    const timestamp = '2026-04-28T00:00:00.000Z';
    const service: Pick<HealthService, 'getHealth'> = {
      getHealth: () =>
        Promise.resolve({ status: 'DOWN', db: 'DOWN', redis: 'UP', timestamp } as never)
    };
    const response = { status: jest.fn() };

    const controller = new HealthController(service as HealthService);

    await expect(controller.getHealth(response as never)).resolves.toMatchObject({
      status: 'DOWN',
      db: 'DOWN'
    });
    expect(response.status).toHaveBeenCalledWith(503);
  });

  it('可通过 Nest testing module 注入 HealthService', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRawUnsafe: jest.fn().mockResolvedValue([{ ok: 1 }])
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();

    const controller = moduleRef.get(HealthController);
    await expect(controller.getHealth({ status: jest.fn() } as never)).resolves.toMatchObject({
      db: 'UP',
      redis: 'DOWN'
    });
  });
});
