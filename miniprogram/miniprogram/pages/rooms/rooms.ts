import { loadRoomCards } from '../../services/rooms';
import { restoreSession } from '../../services/session';
import { RoomCard } from '../../services/types';

type FilterKey = 'all' | 'power' | 'window' | 'overnight';

Page({
  data: {
    rooms: [] as RoomCard[],
    visibleRooms: [] as RoomCard[],
    activeFilter: 'all' as FilterKey,
    query: '',
    loading: false
  },
  onShow() {
    if (!restoreSession()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    void this.loadRooms();
  },
  async loadRooms() {
    this.setData({ loading: true });
    const result = await loadRoomCards();
    this.setData({
      rooms: result.rooms,
      loading: false
    });
    this.applyFilter();
  },
  onSearchInput(event: { detail: { value: string } }) {
    this.setData({ query: event.detail.value });
    this.applyFilter();
  },
  chooseFilter(event: { currentTarget: { dataset: { key?: FilterKey } } }) {
    this.setData({ activeFilter: event.currentTarget.dataset.key ?? 'all' });
    this.applyFilter();
  },
  applyFilter() {
    const query = this.data.query.trim();
    const filtered = this.data.rooms.filter((room) => {
      const keywordMatched = !query || `${room.name}${room.building}${room.tags.join('')}`.includes(query);
      const filterMatched =
        this.data.activeFilter === 'all' ||
        (this.data.activeFilter === 'power' && room.tags.includes('插座')) ||
        (this.data.activeFilter === 'window' && room.tags.includes('靠窗')) ||
        (this.data.activeFilter === 'overnight' && room.overnight);
      return keywordMatched && filterMatched;
    });
    this.setData({ visibleRooms: filtered });
  },
  openRoom(event: { currentTarget: { dataset: { id?: string; name?: string } } }) {
    const id = event.currentTarget.dataset.id ?? '';
    const name = event.currentTarget.dataset.name ?? '';
    wx.navigateTo({ url: `/pages/seat-map/seat-map?roomId=${id}&roomName=${encodeURIComponent(name)}` });
  }
});
