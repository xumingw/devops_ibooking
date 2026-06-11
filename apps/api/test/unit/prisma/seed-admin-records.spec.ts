import { createHeatmapBookingInputs } from '../../../prisma/seed-admin-records';

describe('seed admin records fixtures', () => {
  it('生成足够密集的全周热力图预约记录', () => {
    const bookings = createHeatmapBookingInputs({
      mondayStart: new Date('2026-06-08T16:00:00.000Z'),
      now: new Date('2026-06-09T12:00:00.000Z'),
      students: Array.from({ length: 160 }, (_, index) => `user-stu-seed-${index + 1}`)
    });

    const occupiedBuckets = new Map<string, number>();
    bookings.forEach((booking) => {
      const bucket = `${booking.startAt.getTime()}`;
      occupiedBuckets.set(bucket, (occupiedBuckets.get(bucket) ?? 0) + 1);
    });

    expect(occupiedBuckets.size).toBe(7 * 16);
    expect(bookings.length).toBeGreaterThan(7000);
    expect(Math.max(...occupiedBuckets.values())).toBeGreaterThanOrEqual(110);
    expect(
      Array.from(occupiedBuckets.values()).filter((count) => count >= 60).length
    ).toBeGreaterThan(60);
  });
});
