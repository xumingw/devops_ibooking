import { resolveJwtSecret } from '../../../src/auth/auth.module';

describe('AuthModule JWT secret configuration', () => {
  const config = (values: Record<string, string | undefined>) => ({
    get: jest.fn((key: string) => values[key])
  });

  it.each([undefined, '', '   '])(
    '生产环境缺少 JWT_SECRET 时拒绝启动认证模块: %s',
    (jwtSecret) => {
      expect(() =>
        resolveJwtSecret(config({ NODE_ENV: 'production', JWT_SECRET: jwtSecret }))
      ).toThrow('JWT_SECRET is required in production');
    }
  );

  it.each(['change-me', 'dev-only-change-me', 'replace-with-at-least-32-random-characters'])(
    '生产环境拒绝使用示例 JWT_SECRET: %s',
    (jwtSecret) => {
      expect(() =>
        resolveJwtSecret(config({ NODE_ENV: 'production', JWT_SECRET: jwtSecret }))
      ).toThrow('JWT_SECRET must not use example values in production');
    }
  );

  it.each(['123456', '0123456789abcdef0123456789abcde'])(
    '生产环境拒绝少于 32 字符的 JWT_SECRET: %s',
    (jwtSecret) => {
      expect(() =>
        resolveJwtSecret(config({ NODE_ENV: 'production', JWT_SECRET: jwtSecret }))
      ).toThrow('JWT_SECRET must be at least 32 characters in production');
    }
  );

  it('生产环境允许至少 32 字符的 JWT_SECRET', () => {
    const jwtSecret = '0123456789abcdef0123456789abcdef';

    expect(resolveJwtSecret(config({ NODE_ENV: 'production', JWT_SECRET: jwtSecret }))).toBe(
      jwtSecret
    );
  });

  it('非生产环境未配置 JWT_SECRET 时保留本地默认值', () => {
    expect(resolveJwtSecret(config({ NODE_ENV: 'development' }))).toBe('dev-only-change-me');
  });
});
