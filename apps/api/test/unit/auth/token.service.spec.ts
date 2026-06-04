type TokenServiceConstructor = typeof import('../../../src/auth/token.service').TokenService;

function loadTokenServiceWithCryptoSpy(): {
  TokenService: TokenServiceConstructor;
  timingSafeEqual: jest.Mock;
} {
  jest.resetModules();
  const actualCrypto = jest.requireActual<typeof import('crypto')>('crypto');
  const timingSafeEqual = jest.fn(actualCrypto.timingSafeEqual);
  jest.doMock('crypto', () => ({
    ...actualCrypto,
    timingSafeEqual
  }));
  const { TokenService } = jest.requireActual<{
    TokenService: TokenServiceConstructor;
  }>('../../../src/auth/token.service');
  return { TokenService, timingSafeEqual };
}

describe('TokenService', () => {
  afterEach(() => {
    jest.dontMock('crypto');
    jest.resetModules();
  });

  it('uses timing-safe comparison when verifying access token signatures', () => {
    const { TokenService, timingSafeEqual } = loadTokenServiceWithCryptoSpy();
    const service = new TokenService('test-secret', 900);
    const issued = service.signAccessToken({
      userId: 'u-student',
      studentNo: 'stu_cse_01',
      roles: ['ROLE_STUDENT'],
      permissions: ['booking.create'],
      now: new Date('2026-05-26T12:00:00.000Z')
    });

    const payload = service.verifyAccessToken(issued.token, new Date('2026-05-26T12:05:00.000Z'));

    expect(payload.sub).toBe('u-student');
    expect(timingSafeEqual).toHaveBeenCalledTimes(1);
    expect(timingSafeEqual.mock.calls[0][0]).toBeInstanceOf(Buffer);
    expect(timingSafeEqual.mock.calls[0][1]).toBeInstanceOf(Buffer);
  });

  it('rejects tampered signatures without throwing buffer length errors', () => {
    const { TokenService } = loadTokenServiceWithCryptoSpy();
    const service = new TokenService('test-secret', 900);
    const issued = service.signAccessToken({
      userId: 'u-student',
      studentNo: 'stu_cse_01',
      roles: ['ROLE_STUDENT'],
      permissions: ['booking.create'],
      now: new Date('2026-05-26T12:00:00.000Z')
    });
    const [encodedHeader, encodedPayload] = issued.token.split('.');

    expect(() =>
      service.verifyAccessToken(`${encodedHeader}.${encodedPayload}.short`, new Date('2026-05-26T12:05:00.000Z'))
    ).toThrow('invalid token signature');
  });

  it('rejects same-length tampered signatures', () => {
    const { TokenService } = loadTokenServiceWithCryptoSpy();
    const service = new TokenService('test-secret', 900);
    const issued = service.signAccessToken({
      userId: 'u-student',
      studentNo: 'stu_cse_01',
      roles: ['ROLE_STUDENT'],
      permissions: ['booking.create'],
      now: new Date('2026-05-26T12:00:00.000Z')
    });
    const [encodedHeader, encodedPayload, signature] = issued.token.split('.');
    const replacement = signature.endsWith('A') ? 'B' : 'A';
    const tamperedSignature = `${signature.slice(0, -1)}${replacement}`;

    expect(tamperedSignature).toHaveLength(signature.length);
    expect(() =>
      service.verifyAccessToken(
        `${encodedHeader}.${encodedPayload}.${tamperedSignature}`,
        new Date('2026-05-26T12:05:00.000Z')
      )
    ).toThrow('invalid token signature');
  });
});
