import { StudentBookingRecord } from '@ibooking/shared-types';
import { BookingRepository, BookingsService } from '../../../src/bookings/bookings.service';

describe('BookingsService', () => {
  let repository: jest.Mocked<BookingRepository>;
  let service: BookingsService;

  beforeEach(() => {
    repository = {
      listByUserId: jest.fn()
    };
    service = new BookingsService(repository);
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
