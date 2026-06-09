const DAY_MS = 24 * 60 * 60 * 1000;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

const CURRENT_WEEK_STUDY_PLAN = [
  { roomId: 'room-gm-301', seatId: 'seat-gm-301-a1', startHour: 9, durationHours: 2 },
  { roomId: 'room-science-201', seatId: 'seat-science-201-b1', startHour: 14, durationHours: 1.5 },
  { roomId: 'room-humanities-a', seatId: 'seat-humanities-a-a5', startHour: 10, durationHours: 2.5 },
  { roomId: 'room-library-zone', seatId: 'seat-library-zone-b2', startHour: 15, durationHours: 3 },
  { roomId: 'room-science-403', seatId: 'seat-science-403-c2', startHour: 8, durationHours: 2 },
  { roomId: 'room-news-seminar', seatId: 'seat-news-seminar-d1', startHour: 13, durationHours: 1.5 },
  { roomId: 'room-library-zone', seatId: 'seat-library-zone-e1', startHour: 19, durationHours: 2.5 }
] as const;

const LAST_WEEK_STUDY_PLAN = [
  { roomId: 'room-gm-301', seatId: 'seat-gm-301-a2', dayOffset: 1, startHour: 10, durationHours: 2 },
  { roomId: 'room-science-201', seatId: 'seat-science-201-b2', dayOffset: 3, startHour: 14, durationHours: 1.5 },
  { roomId: 'room-humanities-a', seatId: 'seat-humanities-a-a5', dayOffset: 5, startHour: 9, durationHours: 1.5 }
] as const;

export type SeedStudyBooking = {
  id: string;
  userId: string;
  roomId: string;
  seatId: string;
  startAt: Date;
  endAt: Date;
};

export function createStudentStudyHistoryBookings(input: {
  userId: string;
  now?: Date;
}): SeedStudyBooking[] {
  const now = input.now ?? new Date();
  const weekStart = getShanghaiWeekStart(now);
  const lastWeekStart = new Date(weekStart.getTime() - 7 * DAY_MS);

  const currentWeekBookings = CURRENT_WEEK_STUDY_PLAN.map((plan, index) => {
    const dayStart = new Date(weekStart.getTime() + index * DAY_MS);
    const startAt = addShanghaiHours(dayStart, plan.startHour);
    return {
      id: `seed-study-this-week-${index + 1}`,
      userId: input.userId,
      roomId: plan.roomId,
      seatId: plan.seatId,
      startAt,
      endAt: addShanghaiHours(startAt, plan.durationHours)
    };
  });

  const lastWeekBookings = LAST_WEEK_STUDY_PLAN.map((plan, index) => {
    const dayStart = new Date(lastWeekStart.getTime() + plan.dayOffset * DAY_MS);
    const startAt = addShanghaiHours(dayStart, plan.startHour);
    return {
      id: `seed-study-last-week-${index + 1}`,
      userId: input.userId,
      roomId: plan.roomId,
      seatId: plan.seatId,
      startAt,
      endAt: addShanghaiHours(startAt, plan.durationHours)
    };
  });

  return [...currentWeekBookings, ...lastWeekBookings];
}

function getShanghaiDayStart(date: Date): Date {
  const shiftedTime = date.getTime() + SHANGHAI_OFFSET_MS;
  return new Date(Math.floor(shiftedTime / DAY_MS) * DAY_MS - SHANGHAI_OFFSET_MS);
}

function getShanghaiWeekStart(date: Date): Date {
  const dayStart = getShanghaiDayStart(date);
  const shanghaiDate = new Date(date.getTime() + SHANGHAI_OFFSET_MS);
  const daysSinceMonday = (shanghaiDate.getUTCDay() + 6) % 7;
  return new Date(dayStart.getTime() - daysSinceMonday * DAY_MS);
}

function addShanghaiHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
