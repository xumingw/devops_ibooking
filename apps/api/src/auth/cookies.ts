import { Request, Response } from 'express';

export const REFRESH_COOKIE_NAME = 'refreshToken';

function resolveRefreshCookieSecure(): boolean {
  const configured = process.env.REFRESH_COOKIE_SECURE?.trim().toLowerCase();
  if (configured === 'true' || configured === '1') return true;
  if (configured === 'false' || configured === '0') return false;
  return process.env.NODE_ENV === 'production';
}

export function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (rawKey === name) return decodeURIComponent(rawValue.join('='));
  }
  return null;
}

export function setRefreshCookie(response: Response, token: string, expiresAt: Date): void {
  response.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: resolveRefreshCookieSecure(),
    sameSite: 'lax',
    path: '/api/v1/auth',
    expires: expiresAt
  });
}

export function clearRefreshCookie(response: Response): void {
  response.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: resolveRefreshCookieSecure(),
    sameSite: 'lax',
    path: '/api/v1/auth'
  });
}
