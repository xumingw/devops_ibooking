import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ErrorCode, LoginResponse, MeResponse } from '@ibooking/shared-types';
import { AuthService, AuthSession } from './auth.service';
import { AdminLoginDto, StudentLoginDto, UnifiedLoginDto } from './auth.dto';
import {
  clearRefreshCookie,
  readCookie,
  REFRESH_COOKIE_NAME,
  setRefreshCookie
} from './cookies';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: UnifiedLoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponse> {
    return this.withRefreshCookie(await this.authService.login(body), response);
  }

  @Post('student-login')
  async studentLogin(
    @Body() body: StudentLoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponse> {
    return this.withRefreshCookie(await this.authService.loginStudent(body), response);
  }

  @Post('admin-login')
  async adminLogin(
    @Body() body: AdminLoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponse> {
    return this.withRefreshCookie(await this.authService.loginAdmin(body), response);
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<LoginResponse> {
    const refreshToken = this.requireRefreshToken(request);
    return this.withRefreshCookie(await this.authService.refresh(refreshToken), response);
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ success: true }> {
    const refreshToken = readCookie(request, REFRESH_COOKIE_NAME);
    if (refreshToken) await this.authService.logout(refreshToken);
    clearRefreshCookie(response);
    return { success: true };
  }

  @Get('me')
  getMe(@Req() request: Request): Promise<MeResponse> {
    return this.authService.getMe(this.requireAccessToken(request));
  }

  private withRefreshCookie(session: AuthSession, response: Response): LoginResponse {
    setRefreshCookie(response, session.refreshToken, session.refreshExpiresAt);
    return session.response;
  }

  private requireRefreshToken(request: Request): string {
    const token = readCookie(request, REFRESH_COOKIE_NAME);
    if (!token) {
      throw new UnauthorizedException({
        code: ErrorCode.REFRESH_TOKEN_INVALID,
        message: '会话已过期，请重新登录'
      });
    }
    return token;
  }

  private requireAccessToken(request: Request): string {
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
