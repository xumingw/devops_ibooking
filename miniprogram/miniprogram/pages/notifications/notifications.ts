import { loadNotifications, markNotificationsRead } from '../../services/notifications';
import { restoreSession } from '../../services/session';
import { DemoNotification } from '../../services/types';

type NotificationGroup = {
  title: DemoNotification['group'];
  items: DemoNotification[];
};

const GROUP_ORDER: DemoNotification['group'][] = ['今天', '昨天', '更早'];

function groupNotifications(notifications: DemoNotification[]): NotificationGroup[] {
  return GROUP_ORDER.map((title) => ({
    title,
    items: notifications.filter((notice) => notice.group === title)
  })).filter((group) => group.items.length > 0);
}

function getUnreadCount(notifications: DemoNotification[]): number {
  return notifications.filter((notice) => !notice.read).length;
}

Page({
  data: {
    groups: [] as NotificationGroup[],
    unreadCount: 0
  },
  onShow() {
    if (!restoreSession()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.refreshNotifications();
  },
  refreshNotifications() {
    const notifications = loadNotifications();
    this.setData({
      groups: groupNotifications(notifications),
      unreadCount: getUnreadCount(notifications)
    });
  },
  markAllRead() {
    const ids = this.data.groups.flatMap((group) => group.items.map((notice) => notice.id));
    markNotificationsRead(ids);
    this.refreshNotifications();
  },
  openNotification(event: { currentTarget: { dataset: { id?: string; mode?: string; url?: string } } }) {
    const { id, mode, url } = event.currentTarget.dataset;
    if (id) {
      markNotificationsRead([id]);
      this.refreshNotifications();
    }
    if (!url) {
      return;
    }
    if (mode === 'reLaunch') {
      wx.reLaunch({ url });
      return;
    }
    wx.navigateTo({ url });
  }
});
