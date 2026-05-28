import { getApiBaseUrl } from './config';
import { dropSession, restoreSession } from './session';
import { ApiResponse } from './types';

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code = 'REQUEST_FAILED'
  ) {
    super(message);
  }
}

export function requestApi<T>(
  path: string,
  options: { method?: RequestMethod; data?: unknown; auth?: boolean } = {}
): Promise<T> {
  const session = restoreSession();
  const needsAuth = options.auth !== false;
  const headers: Record<string, string> = {
    'content-type': 'application/json'
  };

  if (needsAuth && session?.accessToken) {
    headers.authorization = `Bearer ${session.accessToken}`;
  }

  return new Promise<T>((resolve, reject) => {
    wx.request<ApiResponse<T>>({
      url: `${getApiBaseUrl()}${path}`,
      method: options.method ?? 'GET',
      data: options.data,
      header: headers,
      timeout: 5000,
      success(result) {
        const payload = result.data;
        if (result.statusCode >= 200 && result.statusCode < 300 && payload?.code === 'SUCCESS') {
          resolve(payload.data);
          return;
        }

        reject(
          new ApiError(
            payload?.message || `请求失败(${result.statusCode})`,
            result.statusCode,
            payload?.code
          )
        );
        if (needsAuth && result.statusCode === 401) {
          handleUnauthorizedSession();
        }
      },
      fail(error) {
        reject(new ApiError(error.errMsg || '无法连接后端服务', 0, 'NETWORK_FAILED'));
      }
    });
  });
}

function handleUnauthorizedSession(): void {
  dropSession();
  const app = getApp();
  app.globalData.accessToken = '';
  app.globalData.userName = '';
  wx.reLaunch({ url: '/pages/login/login' });
}
