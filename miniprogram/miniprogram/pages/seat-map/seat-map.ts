import { addDemoBooking } from '../../services/bookings';
import { createSeatGrid } from '../../services/mock-data';
import { SeatCell } from '../../services/types';

Page({
  data: {
    roomId: '',
    roomName: '经管自习室 301',
    selectedSeat: 'C4',
    rowLabels: ['A', 'B', 'C', 'D'],
    rows: [] as SeatCell[][],
    selectedFeatures: ['插座', '安静区']
  },
  onLoad(query?: Record<string, string>) {
    const selectedSeat = 'C4';
    this.setData({
      roomId: query?.roomId ?? 'room-gm-301',
      roomName: query?.roomName ? decodeURIComponent(query.roomName) : '经管自习室 301',
      selectedSeat,
      rows: createSeatGrid(selectedSeat)
    });
  },
  chooseSeat(event: { currentTarget: { dataset: { code?: string; status?: string; power?: string | boolean; window?: string | boolean } } }) {
    if (event.currentTarget.dataset.status !== 'available' && event.currentTarget.dataset.status !== 'selected') {
      wx.showToast({ title: '该座位暂不可预约', icon: 'none' });
      return;
    }
    const code = event.currentTarget.dataset.code ?? 'C4';
    const hasPower = event.currentTarget.dataset.power === true || event.currentTarget.dataset.power === 'true';
    const nearWindow = event.currentTarget.dataset.window === true || event.currentTarget.dataset.window === 'true';
    const features = [
      hasPower ? '插座' : '',
      nearWindow ? '靠窗' : '安静区'
    ].filter(Boolean);
    this.setData({
      selectedSeat: code,
      rows: createSeatGrid(code),
      selectedFeatures: features
    });
  },
  confirmBooking() {
    const booking = addDemoBooking({
      room: this.data.roomName,
      roomId: this.data.roomId,
      seat: this.data.selectedSeat
    });
    wx.showModal({
      title: '预约成功',
      content: `${booking.room} ${booking.seat}，今日 14:00-17:00。`,
      showCancel: false,
      success: () => {
        wx.reLaunch({ url: '/pages/bookings/bookings' });
      }
    });
  }
});
