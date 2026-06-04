import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createServer, type Server } from 'node:net';
import { HealthService, pingRedis } from '../../../src/health/health.service';
import { PrismaService } from '../../../src/database/prisma.service';

describe('HealthService', () => {
  it('数据库探测失败时返回 DOWN，不再硬编码 UP', async () => {
    const service = await createService({
      queryRawUnsafe: jest.fn().mockRejectedValue(new Error('database unavailable')),
      redisUrl: undefined
    });

    await expect(service.getHealth()).resolves.toMatchObject({
      status: 'DOWN',
      db: 'DOWN',
      redis: 'DOWN'
    });
  });

  it('未配置 Redis 时返回 DOWN，不再硬编码 UP', async () => {
    const service = await createService({
      queryRawUnsafe: jest.fn().mockResolvedValue([{ ok: 1 }]),
      redisUrl: undefined
    });

    await expect(service.getHealth()).resolves.toMatchObject({
      status: 'DOWN',
      db: 'UP',
      redis: 'DOWN'
    });
  });

  it('Redis PING 返回 PONG 时标记 Redis 为 UP', async () => {
    const server = await startRedisLikeServer();

    try {
      const port = (server.address() as { port: number }).port;
      await expect(pingRedis(`redis://127.0.0.1:${port}`)).resolves.toBe('UP');
    } finally {
      await closeServer(server);
    }
  });

  it('Redis 连接关闭但没有返回 PONG 时标记 Redis 为 DOWN', async () => {
    const server = await startClosingServer();

    try {
      const port = (server.address() as { port: number }).port;
      await expect(
        Promise.race([pingRedis(`redis://127.0.0.1:${port}`, 50), delay('PENDING', 100)])
      ).resolves.toBe('DOWN');
    } finally {
      await closeServer(server);
    }
  });
});

function startRedisLikeServer(): Promise<Server> {
  const server = createServer((socket) => {
    socket.once('data', () => {
      socket.write('+PONG\r\n');
    });
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function startClosingServer(): Promise<Server> {
  const server = createServer((socket) => {
    socket.end();
    socket.destroy();
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

async function createService(input: {
  queryRawUnsafe: jest.Mock;
  redisUrl: string | undefined;
}): Promise<HealthService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      HealthService,
      {
        provide: PrismaService,
        useValue: {
          $queryRawUnsafe: input.queryRawUnsafe
        }
      },
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn((key: string) => (key === 'REDIS_URL' ? input.redisUrl : undefined))
        }
      }
    ]
  }).compile();

  return moduleRef.get(HealthService);
}
