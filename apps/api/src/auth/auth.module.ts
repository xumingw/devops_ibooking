import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { AuthController } from './auth.controller';
import { AUTH_OPTIONS, AUTH_REPOSITORY, AuthService } from './auth.service';
import { PasswordHasher } from './password-hasher';
import { PrismaAuthRepository } from './prisma-auth.repository';
import { TokenService } from './token.service';
import { AuthGuard } from './auth.guard';
import { PermissionsGuard } from './permissions.guard';

const EXAMPLE_JWT_SECRETS = new Set([
  'change-me',
  'dev-only-change-me',
  'replace-with-at-least-32-random-characters'
]);

@Module({
  controllers: [AuthController],
  providers: [
    PrismaService,
    PasswordHasher,
    AuthService,
    AuthGuard,
    PermissionsGuard,
    PrismaAuthRepository,
    {
      provide: AUTH_REPOSITORY,
      useExisting: PrismaAuthRepository
    },
    {
      provide: TokenService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new TokenService(
          resolveJwtSecret(config),
          parseDurationSeconds(config.get<string>('JWT_EXPIRES_IN') ?? '15m')
        )
    },
    {
      provide: AUTH_OPTIONS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        refreshTtlSeconds: parseDurationSeconds(
          config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d'
        )
      })
    }
  ],
  exports: [AuthService, AuthGuard, PermissionsGuard]
})
export class AuthModule {}

export function resolveJwtSecret(config: Pick<ConfigService, 'get'>): string {
  const nodeEnv = config.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
  const jwtSecret = config.get<string>('JWT_SECRET')?.trim();

  if (nodeEnv === 'production') {
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required in production');
    }
    if (EXAMPLE_JWT_SECRETS.has(jwtSecret)) {
      throw new Error('JWT_SECRET must not use example values in production');
    }
  }

  return jwtSecret || 'dev-only-change-me';
}

export function parseDurationSeconds(value: string): number {
  const match = /^(\d+)([smhd])?$/.exec(value.trim());
  if (!match) return 900;
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const scale: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * scale[unit];
}
