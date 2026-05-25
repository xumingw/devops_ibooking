import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorCode, MeResponse } from '@ibooking/shared-types';
import { Request } from 'express';
import { AuthService } from './auth.service';

export type AuthContext = {
  user: MeResponse['user'];
  roles: MeResponse['roles'];
  permissions: string[];
};

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);
    const me = await this.authService.getMe(token);
    request.auth = {
      ...me,
      permissions: me.permissions.map((permission) => permission.code)
    };
    return true;
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers.authorization ?? '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_UNAUTHORIZED,
        message: '缺少登录令牌'
      });
    }
    return token;
  }
}
