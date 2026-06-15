import { UserPreferences } from './types';

const PREFERENCES_KEY = 'ibooking.userPreferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  seatFeatures: ['power', 'quiet'],
  reminderMethod: 'wechat',
  startReminder: true,
  checkinReminder: true,
  aiRecommendation: true,
  autoMatch: true
};

const seatLabels: Record<string, string> = {
  power: '插座',
  quiet: '安静区',
  window: '靠窗',
  overnight: '24h'
};

const reminderLabels: Record<UserPreferences['reminderMethod'], string> = {
  wechat: '微信通知',
  email: '邮件提醒',
  none: '不提醒'
};

export function loadPreferences(): UserPreferences {
  const stored = wx.getStorageSync<Partial<UserPreferences> | ''>(PREFERENCES_KEY);
  if (!stored || typeof stored !== 'object') return DEFAULT_PREFERENCES;
  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
    seatFeatures: Array.isArray(stored.seatFeatures)
      ? stored.seatFeatures
      : DEFAULT_PREFERENCES.seatFeatures
  };
}

export function savePreferences(preferences: UserPreferences): UserPreferences {
  wx.setStorageSync(PREFERENCES_KEY, preferences);
  return preferences;
}

export function getSeatPreferenceLabel(preferences = loadPreferences()): string {
  return preferences.seatFeatures.map((feature) => seatLabels[feature]).filter(Boolean).join(' · ') || '未设置';
}

export function getReminderPreferenceLabel(preferences = loadPreferences()): string {
  return reminderLabels[preferences.reminderMethod];
}

export function getRecommendationPreferenceLabel(preferences = loadPreferences()): string {
  return preferences.aiRecommendation ? '已开启' : '已关闭';
}
