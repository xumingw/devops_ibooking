import { loadPreferences, savePreferences } from '../../services/preferences';
import { restoreSession } from '../../services/session';
import { UserPreferences } from '../../services/types';

type PreferenceTab = 'seat' | 'reminder' | 'recommend';

type Choice = {
  key: string;
  label: string;
  active: boolean;
};

const tabs = [
  { key: 'seat', label: '座位偏好' },
  { key: 'reminder', label: '提醒方式' },
  { key: 'recommend', label: '智能推荐' }
];

const seatOptions = [
  { key: 'power', label: '插座' },
  { key: 'quiet', label: '安静区' },
  { key: 'window', label: '靠窗' },
  { key: 'overnight', label: '24h' }
];

const reminderOptions = [
  { key: 'wechat', label: '微信服务通知' },
  { key: 'email', label: '邮件提醒' },
  { key: 'none', label: '不提醒' }
];

function normalizeSection(value?: string): PreferenceTab {
  return value === 'reminder' || value === 'recommend' ? value : 'seat';
}

function buildSeatChoices(preferences: UserPreferences): Choice[] {
  const selected = new Set(preferences.seatFeatures);
  return seatOptions.map((option) => ({
    ...option,
    active: selected.has(option.key)
  }));
}

function buildReminderChoices(preferences: UserPreferences): Choice[] {
  return reminderOptions.map((option) => ({
    ...option,
    active: option.key === preferences.reminderMethod
  }));
}

Page({
  data: {
    tabs,
    activeTab: 'seat' as PreferenceTab,
    preferences: loadPreferences(),
    seatChoices: [] as Choice[],
    reminderChoices: [] as Choice[]
  },
  onLoad(query?: Record<string, string>) {
    if (!restoreSession()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.setData({ activeTab: normalizeSection(query?.section) });
    this.refreshChoices();
  },
  chooseTab(event: { currentTarget: { dataset: { key?: PreferenceTab } } }) {
    this.setData({ activeTab: normalizeSection(event.currentTarget.dataset.key) });
  },
  toggleSeatFeature(event: { currentTarget: { dataset: { key?: string } } }) {
    const key = event.currentTarget.dataset.key;
    if (!key) return;
    const selected = new Set(this.data.preferences.seatFeatures);
    if (selected.has(key)) {
      selected.delete(key);
    } else {
      selected.add(key);
    }
    this.updatePreferences({ seatFeatures: Array.from(selected) });
  },
  chooseReminder(event: { currentTarget: { dataset: { key?: UserPreferences['reminderMethod'] } } }) {
    const key = event.currentTarget.dataset.key;
    if (!key) return;
    this.updatePreferences({ reminderMethod: key });
  },
  toggleSwitch(event: { currentTarget: { dataset: { key?: keyof UserPreferences } }; detail: { value: boolean } }) {
    const key = event.currentTarget.dataset.key;
    if (!key) return;
    this.updatePreferences({ [key]: event.detail.value } as Partial<UserPreferences>);
  },
  updatePreferences(partial: Partial<UserPreferences>) {
    const preferences = savePreferences({
      ...this.data.preferences,
      ...partial
    });
    this.setData({ preferences });
    this.refreshChoices();
  },
  refreshChoices() {
    this.setData({
      seatChoices: buildSeatChoices(this.data.preferences),
      reminderChoices: buildReminderChoices(this.data.preferences)
    });
  },
  save() {
    savePreferences(this.data.preferences);
    wx.showToast({ title: '已保存', icon: 'success' });
    wx.navigateBack();
  }
});
