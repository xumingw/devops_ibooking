declare const wx: WechatMiniprogram.Wx;
declare const App: WechatMiniprogram.App.Constructor;
declare const Page: WechatMiniprogram.Page.Constructor;
declare const Component: WechatMiniprogram.Component.Constructor;
declare function getApp<T extends IAppOption = IAppOption>(): T;
declare function getCurrentPages(): Array<{ route?: string; options?: Record<string, string> }>;

interface IAppOption {
  globalData: {
    apiBaseUrl: string;
    accessToken: string;
    userName: string;
  };
}

declare namespace WechatMiniprogram {
  type GeneralCallbackResult = {
    errMsg: string;
  };

  namespace App {
    type Constructor = (options: {
      globalData: IAppOption['globalData'];
      onLaunch?: () => void;
    }) => void;
  }

  namespace Page {
    type Instance<TData extends Record<string, unknown>> = {
      data: TData;
      setData(data: Partial<TData>): void;
    };

    type Constructor = <TData extends Record<string, unknown>, TMethods extends Record<string, unknown>>(
      options: TMethods & {
        data?: TData;
        onLoad?: (query?: Record<string, string>) => void;
        onShow?: () => void;
      } & ThisType<Instance<TData> & TMethods>
    ) => void;
  }

  namespace Component {
    type Constructor = (options: {
      properties?: Record<string, unknown>;
      data?: Record<string, unknown>;
      methods?: Record<string, (...args: any[]) => unknown>;
    }) => void;
  }

  type RequestOption<T = unknown> = {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: unknown;
    header?: Record<string, string>;
    timeout?: number;
    success?: (result: RequestSuccessCallbackResult<T>) => void;
    fail?: (error: GeneralCallbackResult) => void;
  };

  type RequestSuccessCallbackResult<T = unknown> = {
    data: T;
    statusCode: number;
    header: Record<string, string>;
    cookies?: string[];
    errMsg: string;
  };

  type StorageValue = string | number | boolean | object | null | undefined;

  type Wx = {
    request<T = unknown>(option: RequestOption<T>): void;
    getStorageSync<T = unknown>(key: string): T;
    setStorageSync(key: string, value: StorageValue): void;
    removeStorageSync(key: string): void;
    navigateTo(option: { url: string }): void;
    navigateBack(option?: { delta?: number; fail?: (error: GeneralCallbackResult) => void }): void;
    redirectTo(option: { url: string }): void;
    reLaunch(option: { url: string }): void;
    showToast(option: { title: string; icon?: 'success' | 'error' | 'loading' | 'none'; duration?: number }): void;
    showModal(option: { title: string; content: string; showCancel?: boolean; success?: (result: { confirm: boolean; cancel: boolean }) => void }): void;
    scanCode(option: { onlyFromCamera?: boolean; success?: (result: { result: string }) => void; fail?: (error: GeneralCallbackResult) => void }): void;
  };
}
