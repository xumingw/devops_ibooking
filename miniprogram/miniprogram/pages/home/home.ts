import { loadRoomCards } from '../../services/rooms';
import { restoreSession } from '../../services/session';
import { RoomCard } from '../../services/types';

Page({
  data: {
    userName: '同学',
    avatarName: '同',
    departmentName: '',
    rooms: [] as RoomCard[],
    roomCount: 0,
    availableTotal: 0,
    loading: false
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
      departmentName: session.user.departmentName ?? ''
    });
    void this.loadRooms();
  },
  async loadRooms() {
    this.setData({ loading: true });
    const result = await loadRoomCards();
    this.setData({
      rooms: result.rooms.slice(0, 3),
      roomCount: result.rooms.length,
      availableTotal: result.rooms.reduce((sum, room) => sum + room.available, 0),
      loading: false
    });
  },
  goRooms() {
    wx.reLaunch({ url: '/pages/rooms/rooms' });
  },
  goBookings() {
    wx.reLaunch({ url: '/pages/bookings/bookings' });
  },
  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' });
  },
  goAssistant() {
    wx.reLaunch({ url: '/pages/assistant/assistant' });
  },
  openRoom(event: { currentTarget: { dataset: { id?: string; name?: string } } }) {
    const id = event.currentTarget.dataset.id ?? '';
    const name = event.currentTarget.dataset.name ?? '';
    wx.navigateTo({ url: `/pages/seat-map/seat-map?roomId=${id}&roomName=${encodeURIComponent(name)}` });
  }
});
