import { requestApi } from './http';
import { mockRooms } from './mock-data';
import { ApiState, Room, RoomCard } from './types';

export function toRoomCards(rooms: Room[], source: RoomCard['apiSource']): RoomCard[] {
  return rooms
    .filter((room) => room.status === 'ACTIVE')
    .map((room, index) => {
      const available = Math.max(3, Math.round(room.capacity * (0.18 + (index % 3) * 0.11)));
      const tags = [
        room.scopeType === 'DEPARTMENT' ? '院系限制' : '全校可约',
        room.overnight ? '通宵' : `${room.openHour}:00-${room.closeHour}:00`,
        index % 2 === 0 ? '插座' : '靠窗'
      ];

      return {
        ...room,
        available,
        tags,
        distanceLabel: `${room.building} ${room.floor}楼`,
        apiSource: source
      };
    });
}

export async function loadRoomCards(): Promise<{ rooms: RoomCard[]; state: ApiState }> {
  try {
    const rooms = await requestApi<Room[]>('/api/v1/rooms');
    return {
      rooms: toRoomCards(rooms, 'backend'),
      state: {
        source: 'backend',
        message: '已连接后端 API'
      }
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : '后端暂不可用';
    return {
      rooms: toRoomCards(mockRooms, 'mock'),
      state: {
        source: 'mock',
        message: `${reason}，已切换演示数据`
      }
    };
  }
}
