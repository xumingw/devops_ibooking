import { Response } from 'express';
import { clearRefreshCookie, setRefreshCookie } from '../../../src/auth/cookies';

describe('refresh cookie options', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalRefreshCookieSecure = process.env.REFRESH_COOKIE_SECURE;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalRefreshCookieSecure === undefined) {
      delete process.env.REFRESH_COOKIE_SECURE;
    } else {
      process.env.REFRESH_COOKIE_SECURE = originalRefreshCookieSecure;
    }
  });

  it('allows HTTP production deployments to disable Secure refresh cookies explicitly', () => {
    process.env.NODE_ENV = 'production';
    process.env.REFRESH_COOKIE_SECURE = 'false';
    const expiresAt = new Date('2026-05-26T12:00:00.000Z');
    const response = {
      cookie: jest.fn()
    } as unknown as Response;

    setRefreshCookie(response, 'refresh-token', expiresAt);

    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/api/v1/auth',
        expires: expiresAt
      })
    );
  });

  it('applies the same Secure override when clearing refresh cookies', () => {
    process.env.NODE_ENV = 'production';
    process.env.REFRESH_COOKIE_SECURE = 'false';
    const response = {
      clearCookie: jest.fn()
    } as unknown as Response;

    clearRefreshCookie(response);

    expect(response.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/api/v1/auth'
      })
    );
  });
});
