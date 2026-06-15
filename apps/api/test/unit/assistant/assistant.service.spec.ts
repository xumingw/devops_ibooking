import {
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  StudentAssistantBookingCandidate,
  StudentAssistantSeatCandidate
} from '@ibooking/shared-types';
import {
  AssistantModelClient,
  AssistantRepository,
  AssistantService
} from '../../../src/assistant/assistant.service';

const NOW = new Date('2026-05-30T10:00:00.000Z');

describe('AssistantService', () => {
  let repository: jest.Mocked<AssistantRepository>;
  let modelClient: jest.Mocked<AssistantModelClient>;
  let service: AssistantService;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    repository = {
      findAvailableSeats: jest.fn(),
      findRoomHours: jest.fn(),
      listBookingsByUserId: jest.fn()
    };
    modelClient = {
      interpret: jest.fn()
    };
    service = new AssistantService(repository, modelClient);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('识别今天晚上空座问题并按晚间时段查询可用座位', async () => {
    const seats: StudentAssistantSeatCandidate[] = [
      seatCandidateFixture({
        room: '经管自习室 301',
        seat: 'C3',
        tags: ['插座', '靠窗']
      })
    ];
    modelClient.interpret.mockResolvedValue({
      intent: 'availability',
      dateLabel: '今天',
      timeLabel: '今天晚上',
      startHour: 18,
      endHour: 22,
      filters: { hasPower: false, nearWindow: false, quietZone: false },
      fallbackText: ''
    });
    repository.findAvailableSeats.mockResolvedValue(seats);

    const reply = await service.reply({
      userId: 'user-stu-cse-01',
      departmentId: 'dept-cs',
      message: '今天晚上还有空座吗？'
    });

    expect(reply).toMatchObject({
      intent: 'availability',
      seats,
      bookings: []
    });
    expect(reply.text).toContain('今天 18:00-22:00');
    expect(reply.text).toContain('1 个');
    expect(modelClient.interpret).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '今天晚上还有空座吗？',
        now: NOW
      })
    );
    expect(repository.findAvailableSeats).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-stu-cse-01',
        departmentId: 'dept-cs',
        filters: { hasPower: false, nearWindow: false, quietZone: false },
        timeLabel: '今天 18:00-22:00'
      })
    );
    const [{ timeRange }] = repository.findAvailableSeats.mock.calls[0];
    expect(timeRange.startAt.toISOString()).toBe('2026-05-30T10:00:00.000Z');
    expect(timeRange.endAt.toISOString()).toBe('2026-05-30T14:00:00.000Z');
  });

  it('识别靠窗和插座条件并把筛选条件传给座位查询', async () => {
    modelClient.interpret.mockResolvedValue({
      intent: 'seat_search',
      dateLabel: '今天',
      timeLabel: '今天全天',
      startHour: 8,
      endHour: 22,
      filters: { hasPower: true, nearWindow: true, quietZone: false },
      fallbackText: ''
    });
    repository.findAvailableSeats.mockResolvedValue([
      seatCandidateFixture({
        room: '计算机学院自习室 B',
        seat: 'A8',
        tags: ['插座', '靠窗', '安静区']
      })
    ]);

    const reply = await service.reply({
      userId: 'user-stu-cse-01',
      departmentId: 'dept-cs',
      message: '帮我找靠窗且有插座的座位'
    });

    expect(reply.intent).toBe('seat_search');
    expect(reply.text).toContain('靠窗');
    expect(reply.text).toContain('插座');
    expect(repository.findAvailableSeats).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { hasPower: true, nearWindow: true, quietZone: false }
      })
    );
    const [{ timeRange }] = repository.findAvailableSeats.mock.calls[0];
    expect(timeRange.startAt.getTime()).toBeGreaterThanOrEqual(NOW.getTime());
    expect(timeRange.endAt.getTime() - timeRange.startAt.getTime()).toBeLessThanOrEqual(
      4 * 60 * 60 * 1000
    );
  });

  it('识别我的预约问题并只查询当前用户的当日预约', async () => {
    const bookings: StudentAssistantBookingCandidate[] = [
      {
        bookingId: 'booking-current',
        room: '经管自习室 301',
        location: '光华楼 A座 3楼',
        seat: 'C3',
        time: '今日 14:00-17:00',
        status: 'upcoming',
        actions: ['CHECK_IN', 'DETAIL']
      }
    ];
    modelClient.interpret.mockResolvedValue({
      intent: 'my_bookings',
      dateLabel: '今天',
      timeLabel: '今天全天',
      startHour: 8,
      endHour: 22,
      filters: { hasPower: false, nearWindow: false, quietZone: false },
      fallbackText: ''
    });
    repository.listBookingsByUserId.mockResolvedValue(bookings);

    const reply = await service.reply({
      userId: 'user-stu-cse-01',
      departmentId: 'dept-cs',
      message: '我今天定了哪里的座位'
    });

    expect(reply).toMatchObject({
      intent: 'my_bookings',
      seats: [],
      bookings
    });
    expect(reply.text).toContain('今日预约');
    expect(repository.listBookingsByUserId).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-stu-cse-01',
        dateLabel: '今天'
      })
    );
    expect(repository.findAvailableSeats).not.toHaveBeenCalled();
  });

  it('无法识别的问题返回兜底建议且不访问业务仓储', async () => {
    modelClient.interpret.mockResolvedValue({
      intent: 'fallback',
      dateLabel: '今天',
      timeLabel: '今天全天',
      startHour: 8,
      endHour: 22,
      filters: { hasPower: false, nearWindow: false, quietZone: false },
      fallbackText: '我能帮你查空座、按条件找座、查看我的预约。'
    });

    const reply = await service.reply({
      userId: 'user-stu-cse-01',
      departmentId: 'dept-cs',
      message: '帮我写一篇论文'
    });

    expect(reply.intent).toBe('fallback');
    expect(reply.text).toContain('我能帮你查空座');
    expect(reply.suggestions).toEqual(['今晚还有空座吗', '找靠窗座位', '我今天定了哪里']);
    expect(repository.findAvailableSeats).not.toHaveBeenCalled();
    expect(repository.listBookingsByUserId).not.toHaveBeenCalled();
  });

  it('模型未配置时使用本地关键词规则继续回答空座问题', async () => {
    const seats: StudentAssistantSeatCandidate[] = [
      seatCandidateFixture({
        room: '经管自习室 301',
        seat: 'A1',
        tags: ['插座']
      })
    ];
    modelClient.interpret.mockRejectedValue(
      new ServiceUnavailableException({ message: '智能助手模型未配置' })
    );
    repository.findAvailableSeats.mockResolvedValue(seats);

    const reply = await service.reply({
      userId: 'user-stu-cse-01',
      departmentId: 'dept-cs',
      message: '今晚还有空座吗？要有插座'
    });

    expect(reply.intent).toBe('seat_search');
    expect(reply.text).toContain('今天 18:00-22:00');
    expect(reply.text).toContain('插座');
    expect(reply.seats).toEqual(seats);
    expect(repository.findAvailableSeats).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { hasPower: true, nearWindow: false, quietZone: false },
        timeLabel: '今天 18:00-22:00'
      })
    );
  });

  it('按上海时间修正今天全天推荐，避免返回当前时间以前的时段', async () => {
    jest.setSystemTime(new Date('2026-06-04T15:21:00.000Z'));
    modelClient.interpret.mockResolvedValue({
      intent: 'availability',
      dateLabel: '今天',
      timeLabel: '今天全天',
      startHour: 8,
      endHour: 22,
      filters: { hasPower: false, nearWindow: false, quietZone: false },
      fallbackText: ''
    });
    repository.findAvailableSeats.mockResolvedValue([]);

    const reply = await service.reply({
      userId: 'user-stu-cse-01',
      departmentId: 'dept-cs',
      message: '今天还有空位吗？'
    });

    expect(reply.text).toContain('明天 00:00-04:00');
    const [{ timeRange, timeLabel }] = repository.findAvailableSeats.mock.calls[0];
    expect(timeLabel).toBe('明天 00:00-04:00');
    expect(timeRange.startAt).toEqual(new Date('2026-06-04T16:00:00.000Z'));
    expect(timeRange.endAt).toEqual(new Date('2026-06-04T20:00:00.000Z'));
  });

  it('回答自习室关门时间问题时查询房间开放时间', async () => {
    modelClient.interpret.mockRejectedValue(
      new ServiceUnavailableException({ message: '智能助手模型未配置' })
    );
    repository.findRoomHours.mockResolvedValue([
      {
        room: '图书馆自习区',
        location: '李兆基图书馆 2楼',
        openHour: 8,
        closeHour: 22,
        overnight: false,
        closed: false
      }
    ]);

    const reply = await service.reply({
      userId: 'user-stu-cse-01',
      departmentId: 'dept-cs',
      message: '图书馆什么时候关？'
    });

    expect(reply.intent).toBe('fallback');
    expect(reply.text).toContain('图书馆自习区');
    expect(reply.text).toContain('22:00 关闭');
    expect(repository.findRoomHours).toHaveBeenCalledWith(
      expect.objectContaining({
        departmentId: 'dept-cs',
        keyword: '图书馆'
      })
    );
    expect(repository.findAvailableSeats).not.toHaveBeenCalled();
  });
});

function seatCandidateFixture(
  input: Pick<StudentAssistantSeatCandidate, 'room' | 'seat' | 'tags'>
): StudentAssistantSeatCandidate {
  return {
    roomId: 'room-gm-301',
    seatId: 'seat-gm-301-c3',
    location: '光华楼 A座 3楼',
    time: '今天晚上 18:00-22:00',
    ...input
  };
}
