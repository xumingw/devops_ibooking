import { createStudentStudyHistoryBookings } from '../../../prisma/seed-study-history';

describe('seed study history fixtures', () => {
  it('为本周每天生成学习记录，保证首页周记录每天都有真实数据', () => {
    const bookings = createStudentStudyHistoryBookings({
      userId: 'user-stu-cse-01',
      now: new Date('2026-06-09T04:12:00.000Z')
    });

    const currentWeekBookings = bookings.filter((booking) =>
      booking.id.startsWith('seed-study-this-week-')
    );

    expect(currentWeekBookings).toHaveLength(7);
    expect(currentWeekBookings.map((booking) => booking.id)).toEqual([
      'seed-study-this-week-1',
      'seed-study-this-week-2',
      'seed-study-this-week-3',
      'seed-study-this-week-4',
      'seed-study-this-week-5',
      'seed-study-this-week-6',
      'seed-study-this-week-7'
    ]);
    expect(
      currentWeekBookings.map((booking) => booking.endAt.getTime() - booking.startAt.getTime())
    ).toEqual([
      2 * 60 * 60 * 1000,
      1.5 * 60 * 60 * 1000,
      2.5 * 60 * 60 * 1000,
      3 * 60 * 60 * 1000,
      2 * 60 * 60 * 1000,
      1.5 * 60 * 60 * 1000,
      2.5 * 60 * 60 * 1000
    ]);
  });
});
