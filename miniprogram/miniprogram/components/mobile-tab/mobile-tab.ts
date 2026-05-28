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
    onTap(event: { currentTarget: { dataset: { active?: string; key?: string; url?: string } } }) {
      const { active, key, url } = event.currentTarget.dataset;
      if (!key || !url || key === active) return;
      wx.redirectTo({ url });
    }
  }
});
