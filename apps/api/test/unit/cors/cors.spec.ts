import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import {
  createCorsOptions,
  DEFAULT_CORS_ALLOWED_ORIGINS,
  isCorsOriginAllowed,
  parseAllowedCorsOrigins
} from '../../../src/cors';

const resolveCorsOrigin = (options: CorsOptions, requestOrigin?: string) =>
  new Promise<boolean | string | RegExp | (string | RegExp)[]>((resolve, reject) => {
    if (typeof options.origin !== 'function') {
      resolve(options.origin ?? false);
      return;
    }

    options.origin(requestOrigin as string, (error, origin) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(origin ?? false);
    });
  });

describe('CORS options', () => {
  it('parses configured origins into explicit normalized origins', () => {
    expect(
      parseAllowedCorsOrigins(
        'https://admin.fudan.example.cn, http://localhost:5174/, https://student.fudan.example.cn/app'
      )
    ).toEqual([
      'https://admin.fudan.example.cn',
      'http://localhost:5174',
      'https://student.fudan.example.cn'
    ]);
  });

  it('uses local development origins when no explicit config is provided', () => {
    expect(parseAllowedCorsOrigins()).toEqual(DEFAULT_CORS_ALLOWED_ORIGINS);
  });

  it('allows missing Origin headers but rejects non-whitelisted browser origins', async () => {
    const options = createCorsOptions('https://admin.fudan.example.cn,http://localhost:5174');

    expect(options.credentials).toBe(true);
    expect(options.origin).toEqual(expect.any(Function));
    expect(options.origin).not.toBe(true);
    expect(isCorsOriginAllowed(undefined, ['https://admin.fudan.example.cn'])).toBe(true);
    await expect(resolveCorsOrigin(options)).resolves.toBe(true);
    await expect(resolveCorsOrigin(options, 'https://admin.fudan.example.cn')).resolves.toBe(
      'https://admin.fudan.example.cn'
    );
    await expect(resolveCorsOrigin(options, 'https://evil.example.cn')).resolves.toBe(false);
  });
});
