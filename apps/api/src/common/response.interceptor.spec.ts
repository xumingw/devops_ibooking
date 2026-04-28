// @story US0.3.2
// @tc TC-US0.3.2-01
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  it('把 controller 返回值包装成统一响应体', async () => {
    const interceptor = new ResponseInterceptor();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ requestId: 'req-1' })
      })
    };
    const next = {
      handle: () => of({ status: 'UP' })
    };

    const result = await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe(resolve);
    });

    expect(result).toMatchObject({
      code: 'SUCCESS',
      message: 'success',
      data: { status: 'UP' },
      requestId: 'req-1'
    });
    expect((result as { timestamp: string }).timestamp).toEqual(expect.any(String));
  });
});
