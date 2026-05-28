import { loadBookings } from '../../services/bookings';
import { loadRoomCards } from '../../services/rooms';
import { restoreSession } from '../../services/session';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  cards?: SeatSuggestion[];
};

type SeatSuggestion = {
  name: string;
  tags: string[];
  time: string;
};

Page({
  data: {
    messages: [
      {
        id: 'user-demo',
        role: 'user',
        text: '今晚有没有安静的带插座座位'
      },
      {
        id: 'assistant-demo',
        role: 'assistant',
        text: '找到 3 个符合条件的座位！',
        cards: [
          { name: '经管301 · C3', tags: ['插座', '安静'], time: '18:00-22:00' },
          { name: '理工201 · F8', tags: ['插座', '24h'], time: '全天' }
        ]
      }
    ] as ChatMessage[],
    input: '',
    quickQuestions: ['附近空位', '我的预约', '明天上午', '图书馆几点关']
  },
  onShow() {
    if (!restoreSession()) {
      wx.reLaunch({ url: '/pages/login/login' });
    }
  },
  onInput(event: { detail: { value: string } }) {
    this.setData({ input: event.detail.value });
  },
  useQuick(event: { currentTarget: { dataset: { text?: string } } }) {
    const text = event.currentTarget.dataset.text ?? '';
    this.setData({ input: text });
    void this.send();
  },
  async send() {
    const text = this.data.input.trim();
    if (!text) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text
    };
    this.setData({
      messages: [...this.data.messages, userMessage],
      input: ''
    });

    const answer = await this.answerQuestion(text);
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: answer.text,
      cards: answer.cards
    };
    this.setData({
      messages: [...this.data.messages, assistantMessage]
    });
  },
  async answerQuestion(text: string): Promise<{ text: string; cards?: SeatSuggestion[] }> {
    if (text.includes('定了') || text.includes('预约') || text.includes('哪里')) {
      const booking = loadBookings()[0];
      return { text: `你今天的下一场预约是 ${booking.room} ${booking.seat}，时间 ${booking.time}。可从“我的预约”进入签到页。` };
    }

    const result = await loadRoomCards();
    const rooms = result.rooms;

    if (text.includes('靠窗')) {
      const room = rooms.find((item) => item.tags.includes('靠窗')) ?? rooms[0];
      return {
        text: `${room.name} 有靠窗座位，当前约 ${room.available} 个空座。建议选择 A 排或临窗区域。`,
        cards: [{ name: `${room.name} · A5`, tags: ['靠窗', '安静'], time: '18:00-22:00' }]
      };
    }

    if (text.includes('插座') || text.includes('充电')) {
      const room = rooms.find((item) => item.tags.includes('插座')) ?? rooms[0];
      return {
        text: `${room.name} 支持插座筛选，当前约 ${room.available} 个空座。座位图中的金色小点代表电源位。`,
        cards: [{ name: `${room.name} · C3`, tags: ['插座', '安静'], time: '18:00-22:00' }]
      };
    }

    const total = rooms.reduce((sum, room) => sum + room.available, 0);
    return {
      text: `今晚共有约 ${total} 个空座，推荐先看 ${rooms[0]?.name ?? '经管自习室 301'}。`,
      cards: rooms.slice(0, 2).map((room, index) => ({
        name: `${room.name} · ${index === 0 ? 'C3' : 'F8'}`,
        tags: room.tags.slice(0, 2),
        time: index === 0 ? '18:00-22:00' : '全天'
      }))
    };
  }
});
