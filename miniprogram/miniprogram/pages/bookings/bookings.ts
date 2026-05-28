import { loadBookings } from '../../services/bookings';
import { restoreSession } from '../../services/session';
import { DemoBooking } from '../../services/types';

type BookingFilter = '全部' | '待签到' | '使用中' | '已完成' | '违约';

Page({
  data: {
    bookings: [] as DemoBooking[],
    visibleBookings: [] as DemoBooking[],
    filters: ['全部', '待签到', '使用中', '已完成', '违约'] as BookingFilter[],
    activeFilter: '全部' as BookingFilter
  },
  onShow() {
    if (!restoreSession()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    const bookings = loadBookings();
    this.setData({ bookings });
    this.applyFilter();
  },
  chooseFilter(event: { currentTarget: { dataset: { value?: BookingFilter } } }) {
    this.setData({ activeFilter: event.currentTarget.dataset.value ?? '全部' });
    this.applyFilter();
  },
  applyFilter() {
    const active = this.data.activeFilter;
    const visibleBookings =
      active === '全部'
        ? this.data.bookings
        : this.data.bookings.filter((booking) => booking.status === active);
    this.setData({ visibleBookings });
  },
  goCheckin(event: { currentTarget: { dataset: { roomid?: string; room?: string; seat?: string } } }) {
    const query = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/checkin/checkin?roomId=${query.roomid ?? ''}&room=${encodeURIComponent(query.room ?? '')}&seat=${query.seat ?? ''}`
    });
  },
  goRooms() {
    wx.reLaunch({ url: '/pages/rooms/rooms' });
  }
});
