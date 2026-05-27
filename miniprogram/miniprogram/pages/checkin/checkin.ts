import { restoreSession } from '../../services/session';

Page({
  data: {
    roomId: 'room-gm-301',
    room: '经管自习室 301',
    seat: 'C3',
    codeDigits: [
      { id: 'd1', value: '2' },
      { id: 'd2', value: '7' },
      { id: 'd3', value: '4' },
      { id: 'd4', value: '' },
      { id: 'd5', value: '' },
      { id: 'd6', value: '' }
    ],
    status: '待签到'
  },
  onLoad(query?: Record<string, string>) {
    if (!restoreSession()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.setData({
      roomId: query?.roomId ?? 'room-gm-301',
      room: query?.room ? decodeURIComponent(query.room) : '经管自习室 301',
      seat: query?.seat ?? 'C3'
    });
  },
  goBack() {
    wx.navigateBack({ fail: () => wx.reLaunch({ url: '/pages/bookings/bookings' }) });
  },
  scanCode() {
    wx.scanCode({
      onlyFromCamera: false,
      success: () => {
        this.setData({
          status: '签到成功'
        });
        wx.showToast({ title: '签到成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '扫码已取消', icon: 'none' });
      }
    });
  },
  confirmCheckIn() {
    this.setData({
      status: '签到成功',
      codeDigits: [
        { id: 'd1', value: '2' },
        { id: 'd2', value: '7' },
        { id: 'd3', value: '4' },
        { id: 'd4', value: '9' },
        { id: 'd5', value: '2' },
        { id: 'd6', value: '6' }
      ]
    });
    wx.showToast({ title: '签到成功', icon: 'success' });
  }
});
