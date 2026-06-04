import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthResponse } from '@ibooking/shared-types';
import { createConnection } from 'node:net';
import { PrismaService } from '../database/prisma.service';

type DependencyStatus = HealthResponse['db'];

const REDIS_PING_TIMEOUT_MS = 1000;

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async getHealth(): Promise<HealthResponse> {
    const [db, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    return {
      status: db === 'UP' && redis === 'UP' ? 'UP' : 'DOWN',
      db,
      redis,
      timestamp: new Date().toISOString()
    };
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return 'UP';
    } catch {
      return 'DOWN';
    }
  }

  private checkRedis(): Promise<DependencyStatus> {
    return pingRedis(this.config.get<string>('REDIS_URL'), REDIS_PING_TIMEOUT_MS);
  }
}

export function pingRedis(
  redisUrl: string | undefined,
  timeoutMs = REDIS_PING_TIMEOUT_MS
): Promise<DependencyStatus> {
  if (!redisUrl) return Promise.resolve('DOWN');

  let url: URL;
  try {
    url = new URL(redisUrl);
  } catch {
    return Promise.resolve('DOWN');
  }

  if (url.protocol !== 'redis:') return Promise.resolve('DOWN');
  const port = Number(url.port || 6379);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return Promise.resolve('DOWN');

  return new Promise((resolve) => {
    const socket = createConnection({ host: url.hostname || 'localhost', port });
    let settled = false;
    let buffer = '';

    const settle = (status: DependencyStatus) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(status);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      socket.write(`${formatRedisAuthCommand(url)}*1\r\n$4\r\nPING\r\n`);
    });
    socket.on('data', (data) => {
      buffer += data.toString('utf8');
      if (buffer.includes('+PONG')) {
        settle('UP');
        return;
      }
      if (buffer.includes('-ERR') || buffer.includes('-NOAUTH') || buffer.includes('-WRONGPASS')) {
        settle('DOWN');
      }
    });
    socket.once('timeout', () => settle('DOWN'));
    socket.once('error', () => settle('DOWN'));
    socket.once('end', () => settle('DOWN'));
    socket.once('close', () => settle('DOWN'));
  });
}

function formatRedisAuthCommand(url: URL): string {
  if (!url.password) return '';

  const password = decodeURIComponent(url.password);
  if (!url.username) {
    return `*2\r\n$4\r\nAUTH\r\n$${Buffer.byteLength(password)}\r\n${password}\r\n`;
  }

  const username = decodeURIComponent(url.username);
  return [
    '*3',
    '$4',
    'AUTH',
    `$${Buffer.byteLength(username)}`,
    username,
    `$${Buffer.byteLength(password)}`,
    password,
    ''
  ].join('\r\n');
}
