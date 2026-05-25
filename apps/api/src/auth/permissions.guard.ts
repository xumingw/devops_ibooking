import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode } from '@ibooking/shared-types';
import { AuthenticatedRequest } from './auth.guard';
import { REQUIRED_PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const granted = new Set(request.auth?.permissions ?? []);
    const missing = required.filter((permission) => !granted.has(permission));
    if (missing.length === 0) return true;

    throw new ForbiddenException({
      code: ErrorCode.RBAC_FORBIDDEN,
      message: `权限不足：${missing.join(', ')}`
    });
  }
}
