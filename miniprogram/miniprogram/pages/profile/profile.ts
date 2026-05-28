import { clearSession } from '../../services/auth';
import {
  getRecommendationPreferenceLabel,
  getReminderPreferenceLabel,
  getSeatPreferenceLabel,
  loadPreferences
} from '../../services/preferences';
import { restoreSession } from '../../services/session';
import { UserPreferences } from '../../services/types';

function buildMenuGroups(preferences: UserPreferences) {
  return [
    {
      title: '常用功能',
      items: [
        { mark: '★', label: '收藏的座位', sub: '3个' },
        { mark: '◷', label: '历史预约', sub: '18条' },
        { mark: '!', label: '违约记录', sub: '2次', action: 'violations' }
      ]
    },
    {
      title: '偏好设置',
      items: [
        { mark: '⚙', label: '座位偏好', sub: getSeatPreferenceLabel(preferences), action: 'seat-preferences' },
        { mark: '◉', label: '提醒方式', sub: getReminderPreferenceLabel(preferences), action: 'reminder-preferences' },
        { mark: '✦', label: '智能推荐', sub: getRecommendationPreferenceLabel(preferences), action: 'recommend-preferences' }
      ]
    },
    {
      title: '其他',
      items: [
        { mark: 'i', label: '使用帮助', sub: '' },
        { mark: '◇', label: '隐私设置', sub: '' },
        { mark: '↩', label: '退出登录', sub: '', action: 'logout' }
      ]
    }
  ];
}

Page({
  data: {
    userName: '同学',
    avatarName: '同',
    studentNo: '',
    departmentName: '',
    creditLabel: '信用良好',
    stats: [
      { value: '18', label: '本学期预约' },
      { value: '16', label: '已完成' },
      { value: '2.0', label: '违约次数' }
    ],
    menuGroups: buildMenuGroups(loadPreferences())
  },
  onShow() {
    const session = restoreSession();
    if (!session) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.setData({
      userName: session.user.name,
      avatarName: session.user.name.slice(0, 1),
      studentNo: session.user.studentNo,
      departmentName: session.user.departmentName ?? '未绑定院系',
      menuGroups: buildMenuGroups(loadPreferences())
    });
  },
  onMenuTap(event: { currentTarget: { dataset: { action?: string } } }) {
    const action = event.currentTarget.dataset.action;
    if (action === 'violations') {
      wx.navigateTo({ url: '/pages/violations/violations' });
      return;
    }
    if (action === 'seat-preferences') {
      wx.navigateTo({ url: '/pages/preferences/preferences?section=seat' });
      return;
    }
    if (action === 'reminder-preferences') {
      wx.navigateTo({ url: '/pages/preferences/preferences?section=reminder' });
      return;
    }
    if (action === 'recommend-preferences') {
      wx.navigateTo({ url: '/pages/preferences/preferences?section=recommend' });
      return;
    }
    if (action === 'logout') {
      this.logout();
    }
  },
  logout() {
    clearSession();
    wx.reLaunch({ url: '/pages/login/login' });
  }
});
