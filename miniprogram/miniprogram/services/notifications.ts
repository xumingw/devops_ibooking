import { mockNotifications } from './mock-data';
import { DemoNotification } from './types';

const READ_NOTIFICATION_IDS_KEY = 'ibooking.readNotificationIds';

function loadReadIds(): string[] {
  const stored = wx.getStorageSync<string[]>(READ_NOTIFICATION_IDS_KEY);
  return Array.isArray(stored) ? stored : [];
}

export function loadNotifications(): DemoNotification[] {
  const readIds = new Set(loadReadIds());
  return mockNotifications.map((notice) => ({
    ...notice,
    read: notice.read || readIds.has(notice.id)
  }));
}

export function markNotificationsRead(ids: string[]): DemoNotification[] {
  const nextReadIds = Array.from(new Set([...loadReadIds(), ...ids]));
  wx.setStorageSync(READ_NOTIFICATION_IDS_KEY, nextReadIds);
  return loadNotifications();
}
