import type { INestApplication } from '@nestjs/common';

import { configureApp } from '../../../src/main';

jest.mock('../../../src/common/openapi', () => ({
  setupOpenApi: jest.fn()
}));

describe('configureApp CORS setup', () => {
  it('configures credentialed CORS with an origin whitelist function', () => {
    const app = {
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn()
    } as unknown as INestApplication;

    configureApp(app);

    expect(app.enableCors).toHaveBeenCalledTimes(1);
    const [corsOptions] = (app.enableCors as jest.Mock).mock.calls[0];
    expect(corsOptions).toMatchObject({ credentials: true });
    expect(corsOptions.origin).toEqual(expect.any(Function));
    expect(corsOptions.origin).not.toBe(true);
  });
});
