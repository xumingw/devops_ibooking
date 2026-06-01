import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

export type AccessTokenPayload = {
  sub: string;
  studentNo: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
  jti: string;
};

export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly accessTtlSeconds: number
  ) {}

  signAccessToken(input: {
    userId: string;
    studentNo: string;
    roles: string[];
    permissions: string[];
    now?: Date;
  }): { token: string; expiresAt: Date } {
    const now = input.now ?? new Date();
    const iat = Math.floor(now.getTime() / 1000);
    const exp = iat + this.accessTtlSeconds;
    const payload: AccessTokenPayload = {
      sub: input.userId,
      studentNo: input.studentNo,
      roles: input.roles,
      permissions: input.permissions,
      iat,
      exp,
      jti: randomUUID()
    };
    return {
      token: this.sign(payload),
      expiresAt: new Date(exp * 1000)
    };
  }

  verifyAccessToken(token: string, now = new Date()): AccessTokenPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error('invalid token');
    }

    const expected = this.signature(`${encodedHeader}.${encodedPayload}`);
    if (!this.isSignatureEqual(signature, expected)) {
      throw new Error('invalid token signature');
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!this.isAccessTokenPayload(payload)) {
      throw new Error('invalid token payload');
    }
    if (payload.exp <= Math.floor(now.getTime() / 1000)) {
      throw new Error('token expired');
    }

    return payload;
  }

  private sign(payload: AccessTokenPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.signature(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private signature(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private isSignatureEqual(actual: string, expected: string): boolean {
    const actualBuffer = Buffer.from(actual, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
  }

  private isAccessTokenPayload(value: unknown): value is AccessTokenPayload {
    if (!value || typeof value !== 'object') return false;
    const payload = value as Partial<AccessTokenPayload>;
    return (
      typeof payload.sub === 'string' &&
      typeof payload.studentNo === 'string' &&
      Array.isArray(payload.roles) &&
      Array.isArray(payload.permissions) &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number' &&
      typeof payload.jti === 'string'
    );
  }
}
