import { StudentBookingRecord } from '@ibooking/shared-types';
import {
  BookingRepository,
  BookingsService,
  CreateStudentBookingInput
} from '../../../src/bookings/bookings.service';

const NOW = new Date('2026-05-30T06:00:00.000Z');

describe('BookingsService', () => {
  let repository: jest.Mocked<BookingRepository>;
  let service: BookingsService;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    repository = {
      listByUserId: jest.fn(),
      cancelByUserId: jest.fn(),
      createByUserId: jest.fn()
    };
    service = new BookingsService(repository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('汇总当前学生预约并统计可操作预约数', async () => {
    const records: StudentBookingRecord[] = [
      bookingFixture({
        id: 'booking-upcoming',
        room: '经管自习室 301',
        location: '光华楼 A座 3楼',
        seat: 'C3',
        time: '今日 14:00-17:00',
        status: 'upcoming',
        tags: ['插座'],
        canCheckIn: true,
        canCancel: true
      }),
      bookingFixture({
        id: 'booking-using',
        room: '理工自习室 201',
        location: '理科楼 2楼',
        seat: 'F12',
        time: '今日 09:00-12:00',
        status: 'using',
        tags: ['24小时'],
        canCheckIn: false,
        canCancel: false
      }),
      bookingFixture({
        id: 'booking-completed',
        room: '文史馆阅览室 A',
        location: '文史馆 1楼',
        seat: 'A5',
        time: '4月20日 14:00-16:00',
        status: 'completed',
        tags: ['靠窗'],
        canCheckIn: false,
        canCancel: false
      })
    ];
    repository.listByUserId.mockResolvedValue(records);

    await expect(service.getStudentSummary('user-stu-cse-01')).resolves.toEqual({
      totalCount: 3,
      activeCount: 2,
      completedCount: 1,
      records
    });
    expect(repository.listByUserId).toHaveBeenCalledWith('user-stu-cse-01');
  });

  it('取消当前学生预约时只委托当前用户和指定预约', async () => {
    const cancelled = bookingFixture({
      id: 'booking-upcoming',
      room: '经管自习室 301',
      location: '光华楼 A座 3楼',
      seat: 'C3',
      time: '今日 14:00-17:00',
      status: 'cancelled',
      tags: ['插座'],
      canCheckIn: false,
      canCancel: false
    });
    repository.cancelByUserId.mockResolvedValue(cancelled);

    await expect(
      service.cancelStudentBooking('user-stu-cse-01', 'booking-upcoming')
    ).resolves.toEqual(cancelled);
    expect(repository.cancelByUserId).toHaveBeenCalledWith(
      'user-stu-cse-01',
      'booking-upcoming'
    );
  });

  it('创建当前学生预约时校验整点和 4 小时上限后写入仓库', async () => {
    const input: CreateStudentBookingInput = {
      roomId: 'room-gm-301',
      seatId: 'seat-gm-301-c3',
      startAt: '2026-06-01T06:00:00.000Z',
      endAt: '2026-06-01T09:00:00.000Z'
    };
    const created = bookingFixture({
      id: 'booking-created',
      room: '经管自习室 301',
      location: '光华楼 A座 3楼',
      seat: 'C3',
      time: '6月1日 14:00-17:00',
      status: 'upcoming',
      tags: ['插座'],
      canCheckIn: false,
      canCancel: true
    });
    repository.createByUserId.mockResolvedValue(created);

    await expect(service.createStudentBooking('user-stu-cse-01', input)).resolves.toEqual(
      created
    );

    expect(repository.createByUserId).toHaveBeenCalledWith('user-stu-cse-01', input);
  });

  it('拒绝非整点或超过 4 小时的学生预约', async () => {
    await expect(
      service.createStudentBooking('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2020-06-01T06:00:00.000Z',
        endAt: '2020-06-01T09:00:00.000Z'
      })
    ).rejects.toThrow('不能预约已过去的时段');

    await expect(
      service.createStudentBooking('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2026-06-01T06:30:00.000Z',
        endAt: '2026-06-01T09:00:00.000Z'
      })
    ).rejects.toThrow('预约必须按整点开始和结束');

    await expect(
      service.createStudentBooking('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2026-06-01T06:00:00.000Z',
        endAt: '2026-06-01T11:00:00.000Z'
      })
    ).rejects.toThrow('单次预约最长 4 小时');

    expect(repository.createByUserId).not.toHaveBeenCalled();
  });
});

function bookingFixture(
  input: Omit<StudentBookingRecord, 'startAt' | 'endAt'>
): StudentBookingRecord {
  return {
    ...input,
    startAt: '2026-05-29T06:00:00.000Z',
    endAt: '2026-05-29T09:00:00.000Z'
  };
}
