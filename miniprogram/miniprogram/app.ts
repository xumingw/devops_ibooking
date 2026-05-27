import { ensureApiBaseUrl } from './services/config';
import { restoreSession } from './services/session';

App({
  globalData: {
    apiBaseUrl: '',
    accessToken: '',
    userName: ''
  },
  onLaunch() {
    const apiBaseUrl = ensureApiBaseUrl();
    const session = restoreSession();
    this.globalData.apiBaseUrl = apiBaseUrl;
    this.globalData.accessToken = session?.accessToken ?? '';
    this.globalData.userName = session?.user.name ?? '';
  }
});
