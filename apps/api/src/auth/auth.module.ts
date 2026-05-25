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
          config.get<string>('JWT_SECRET') ?? 'dev-only-change-me',
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
  exports: [AuthGuard, PermissionsGuard]
})
export class AuthModule {}

export function parseDurationSeconds(value: string): number {
  const match = /^(\d+)([smhd])?$/.exec(value.trim());
  if (!match) return 900;
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const scale: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * scale[unit];
}
