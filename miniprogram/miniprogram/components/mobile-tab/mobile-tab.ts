const tabs = [
  { key: 'home', label: '首页', mark: '⌂', url: '/pages/home/home' },
  { key: 'rooms', label: '选座', mark: '▦', url: '/pages/rooms/rooms' },
  { key: 'bookings', label: '预约', mark: '◷', url: '/pages/bookings/bookings' },
  { key: 'assistant', label: '助手', mark: '✦', url: '/pages/assistant/assistant' },
  { key: 'profile', label: '我的', mark: '◉', url: '/pages/profile/profile' }
];

Component({
  properties: {
    active: {
      type: String,
      value: 'home'
    }
  },
  data: {
    tabs
  },
  methods: {
    onTap(event: { currentTarget: { dataset: { url?: string } } }) {
      const url = event.currentTarget.dataset.url;
      if (!url) return;
      wx.reLaunch({ url });
    }
  }
});
