const API_BASE_URL_KEY = 'ibooking.apiBaseUrl';
const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export function normalizeApiBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_API_BASE_URL;
  return trimmed.replace(/\/+$/, '');
}

export function ensureApiBaseUrl(): string {
  const stored = wx.getStorageSync<string>(API_BASE_URL_KEY);
  const apiBaseUrl = normalizeApiBaseUrl(typeof stored === 'string' ? stored : '');
  wx.setStorageSync(API_BASE_URL_KEY, apiBaseUrl);
  return apiBaseUrl;
}

export function getApiBaseUrl(): string {
  return ensureApiBaseUrl();
}

export function saveApiBaseUrl(value: string): string {
  const apiBaseUrl = normalizeApiBaseUrl(value);
  wx.setStorageSync(API_BASE_URL_KEY, apiBaseUrl);
  getApp().globalData.apiBaseUrl = apiBaseUrl;
  return apiBaseUrl;
}
