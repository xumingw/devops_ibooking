import { BookingStatus, PrismaClient } from '@prisma/client';

const DAY_MS = 24 * 60 * 60 * 1000;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
const SLOT_MS = 30 * 60 * 1000;

const ADMIN_BOOKING_IDS = [
  'seed-admin-booking-now',
  'seed-admin-booking-today-pending',
  'seed-admin-booking-yesterday',
  'seed-admin-booking-no-show',
  'seed-admin-booking-week-1',
  'seed-admin-booking-week-2',
  'seed-admin-booking-week-3',
  'seed-admin-booking-week-4',
  'seed-admin-booking-week-5',
  'seed-admin-booking-week-6',
  'seed-admin-booking-week-7'
];
const HEATMAP_BOOKING_IDS = Array.from(
  { length: 7 * 6 * 8 },
  (_, index) => `seed-admin-heatmap-${String(index + 1).padStart(3, '0')}`
);
const SEEDED_BOOKING_IDS = [...ADMIN_BOOKING_IDS, ...HEATMAP_BOOKING_IDS];

const ADMIN_AUDIT_IDS = [
  'seed-audit-room-hours',
  'seed-audit-seat-maintenance',
  'seed-audit-param-change',
  'seed-audit-export-report'
];

export async function seedAdminRecords(
  prisma: PrismaClient,
  input: {
    adminUserId: string;
    studentUserIds: string[];
  }
) {
  const now = new Date();
  const todayStart = getShanghaiDayStart(now);
  const currentSlot = floorToSlot(now);
  const mondayStart = getShanghaiWeekStart(now);

  await seedSystemParams(prisma);
  await seedCheckInCodes(prisma, todayStart);
  await resetAdminBookings(prisma);

  const students = input.studentUserIds.length > 0 ? input.studentUserIds : ['user-stu-cse-01'];
  const bookingInputs = [
    bookingInput({
      id: 'seed-admin-booking-now',
      userId: students[0],
      roomId: 'room-gm-301',
      seatId: 'seat-gm-301-c3',
      startAt: currentSlot,
      endAt: new Date(currentSlot.getTime() + 2 * 60 * 60 * 1000),
      status: 'CHECKED_IN'
    }),
    bookingInput({
      id: 'seed-admin-booking-today-pending',
      userId: students[1] ?? students[0],
      roomId: 'room-science-201',
      seatId: 'seat-science-201-f12',
      startAt: new Date(currentSlot.getTime() + 2 * SLOT_MS),
      endAt: new Date(currentSlot.getTime() + 6 * SLOT_MS),
      status: 'PENDING_CHECKIN'
    }),
    bookingInput({
      id: 'seed-admin-booking-yesterday',
      userId: students[2] ?? students[0],
      roomId: 'room-humanities-a',
      seatId: 'seat-humanities-a-a5',
      startAt: new Date(todayStart.getTime() - DAY_MS + 9 * 60 * 60 * 1000),
      endAt: new Date(todayStart.getTime() - DAY_MS + 11 * 60 * 60 * 1000),
      status: 'COMPLETED'
    }),
    bookingInput({
      id: 'seed-admin-booking-no-show',
      userId: students[3] ?? students[0],
      roomId: 'room-science-201',
      seatId: 'seat-science-201-a1',
      startAt: new Date(todayStart.getTime() - DAY_MS + 14 * 60 * 60 * 1000),
      endAt: new Date(todayStart.getTime() - DAY_MS + 16 * 60 * 60 * 1000),
      status: 'CANCELLED_AUTO_NO_CHECKIN'
    }),
    ...Array.from({ length: 7 }, (_, index) => {
      const code = ['A1', 'A2', 'A4', 'A6', 'A7', 'A8', 'B1'][index];
      const roomId = index % 2 === 0 ? 'room-library-zone' : 'room-gm-301';
      const seatIdPrefix = index % 2 === 0 ? 'seat-library-zone' : 'seat-gm-301';
      return bookingInput({
        id: `seed-admin-booking-week-${index + 1}`,
        userId: students[index % students.length],
        roomId,
        seatId: `${seatIdPrefix}-${code.toLowerCase()}`,
        startAt: new Date(mondayStart.getTime() + index * DAY_MS + 10 * 60 * 60 * 1000),
        endAt: new Date(mondayStart.getTime() + index * DAY_MS + 12 * 60 * 60 * 1000),
        status: index < 2 ? 'COMPLETED' : 'PENDING_CHECKIN'
      });
    }),
    ...createHeatmapBookingInputs({
      mondayStart,
      now,
      students
    })
  ];

  for (const booking of bookingInputs) {
    await prisma.booking.create({ data: booking });
    await seedBookingSlots(prisma, booking);
  }

  await prisma.reminderLog.createMany({
    data: [
      {
        id: 'seed-reminder-checkin-success',
        bookingId: 'seed-admin-booking-now',
        type: 'CHECK_IN_SUCCESS',
        channel: 'WEB',
        sentAt: new Date(currentSlot.getTime() + 5 * 60 * 1000)
      },
      {
        id: 'seed-reminder-no-show',
        bookingId: 'seed-admin-booking-no-show',
        type: 'AUTO_CANCEL_NO_CHECKIN',
        channel: 'SYSTEM',
        sentAt: new Date(todayStart.getTime() - DAY_MS + 14 * 60 * 60 * 1000 + 15 * 60 * 1000)
      }
    ],
    skipDuplicates: true
  });

  await prisma.violation.create({
    data: {
      id: 'seed-violation-admin-no-show',
      userId: students[3] ?? students[0],
      bookingId: 'seed-admin-booking-no-show',
      roomId: 'room-science-201',
      seatId: 'seat-science-201-a1',
      reason: 'NO_CHECK_IN',
      occurredAt: new Date(todayStart.getTime() - DAY_MS + 14 * 60 * 60 * 1000 + 15 * 60 * 1000)
    }
  });

  await seedAuditLogs(prisma, input.adminUserId, now);
}

async function seedSystemParams(prisma: PrismaClient) {
  const params = [
    ['booking.maxHours', '4', 'number'],
    ['checkin.graceMinutes', '15', 'number'],
    ['reminder.beforeStartMinutes', '15', 'number'],
    ['reminder.afterStartMinutes', '10', 'number'],
    ['violation.restrictDays', '7', 'number']
  ] as const;

  await Promise.all(
    params.map(([key, value, valueType]) =>
      prisma.systemParam.upsert({
        where: { key },
        update: { value, valueType },
        create: { id: `param-${key.replaceAll('.', '-')}`, key, value, valueType }
      })
    )
  );
}

async function seedCheckInCodes(prisma: PrismaClient, todayStart: Date) {
  const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
  const codes = [
    ['code-gm-301-today', 'room-gm-301', '739214'],
    ['code-science-201-today', 'room-science-201', '318642'],
    ['code-library-zone-today', 'room-library-zone', '952701']
  ] as const;

  await Promise.all(
    codes.map(([id, roomId, code]) =>
      prisma.checkInCode.upsert({
        where: {
          roomId_validAt: {
            roomId,
            validAt: todayStart
          }
        },
        update: {
          code,
          expiresAt: tomorrowStart
        },
        create: {
          id,
          roomId,
          code,
          validAt: todayStart,
          expiresAt: tomorrowStart
        }
      })
    )
  );
}

async function resetAdminBookings(prisma: PrismaClient) {
  await prisma.violation.deleteMany({ where: { bookingId: { in: SEEDED_BOOKING_IDS } } });
  await prisma.reminderLog.deleteMany({ where: { bookingId: { in: SEEDED_BOOKING_IDS } } });
  await prisma.bookingSlot.deleteMany({ where: { bookingId: { in: SEEDED_BOOKING_IDS } } });
  await prisma.booking.deleteMany({ where: { id: { in: SEEDED_BOOKING_IDS } } });
}

async function seedBookingSlots(
  prisma: PrismaClient,
  booking: {
    id: string;
    userId: string;
    seatId: string;
    startAt: Date;
    endAt: Date;
    status: BookingStatus;
  }
) {
  if (!['PENDING_CHECKIN', 'CHECKED_IN', 'COMPLETED'].includes(booking.status)) return;

  const slots = [];
  for (let slotStart = booking.startAt; slotStart < booking.endAt; slotStart = new Date(slotStart.getTime() + SLOT_MS)) {
    slots.push({
      id: `slot-${booking.id}-${slotStart.getTime()}`,
      bookingId: booking.id,
      userId: booking.userId,
      seatId: booking.seatId,
      slotStart
    });
  }

  if (slots.length > 0) {
    await prisma.bookingSlot.createMany({ data: slots, skipDuplicates: true });
  }
}

function createHeatmapBookingInputs(input: {
  mondayStart: Date;
  now: Date;
  students: string[];
}) {
  const hourStarts = [8, 12, 14, 16, 18, 20];
  const rooms = [
    roomSeatPool('room-gm-301', 'seat-gm-301'),
    roomSeatPool('room-science-201', 'seat-science-201'),
    roomSeatPool('room-humanities-a', 'seat-humanities-a'),
    roomSeatPool('room-cs-lab-b', 'seat-cs-lab-b'),
    roomSeatPool('room-news-seminar', 'seat-news-seminar'),
    roomSeatPool('room-science-403', 'seat-science-403'),
    roomSeatPool('room-library-zone', 'seat-library-zone')
  ];
  let bookingIndex = 0;

  return Array.from({ length: 7 }).flatMap((_, dayIndex) =>
    hourStarts.flatMap((hour, hourIndex) => {
      const slotStart = new Date(input.mondayStart.getTime() + dayIndex * DAY_MS + hour * 60 * 60 * 1000);
      const density = ((dayIndex + 2) * (hourIndex + 3)) % 8;
      const bookingCount = Math.max(1, density);

      return Array.from({ length: bookingCount }, (_, parallelIndex) => {
        const room = rooms[(dayIndex + hourIndex + parallelIndex) % rooms.length];
        const seatCode = room.seatCodes[(hourIndex * 2 + parallelIndex) % room.seatCodes.length];
        const startAt = new Date(slotStart);
        const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
        const status = endAt <= input.now ? 'COMPLETED' : startAt <= input.now ? 'CHECKED_IN' : 'PENDING_CHECKIN';
        const id = HEATMAP_BOOKING_IDS[bookingIndex++];
        return bookingInput({
          id,
          userId: input.students[(dayIndex * 11 + hourIndex * 7 + parallelIndex) % input.students.length],
          roomId: room.roomId,
          seatId: `${room.seatIdPrefix}-${seatCode.toLowerCase()}`,
          startAt,
          endAt,
          status
        });
      });
    })
  );
}

function roomSeatPool(roomId: string, seatIdPrefix: string) {
  return {
    roomId,
    seatIdPrefix,
    seatCodes: ['A1', 'A2', 'A4', 'A6', 'A7', 'A8', 'B1', 'B2']
  };
}

async function seedAuditLogs(prisma: PrismaClient, adminUserId: string, now: Date) {
  await prisma.auditLog.deleteMany({ where: { id: { in: ADMIN_AUDIT_IDS } } });
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'seed-audit-room-hours',
        actorId: adminUserId,
        action: '更新开放时间',
        resource: 'room',
        resourceId: 'room-gm-301',
        detail: {
          module: '自习室管理',
          result: 'success',
          ip: '127.0.0.1',
          summary: '经管自习室 301 开放时间同步'
        },
        createdAt: new Date(now.getTime() - 36 * 60 * 1000)
      },
      {
        id: 'seed-audit-seat-maintenance',
        actorId: adminUserId,
        action: '停用维护座位',
        resource: 'seat',
        resourceId: 'seat-science-201-f12',
        detail: {
          module: '座位管理',
          result: 'success',
          ip: '127.0.0.1',
          summary: '标记座位维护状态'
        },
        createdAt: new Date(now.getTime() - 74 * 60 * 1000)
      },
      {
        id: 'seed-audit-param-change',
        actorId: adminUserId,
        action: '调整签到宽限',
        resource: 'system_param',
        resourceId: 'checkin.graceMinutes',
        detail: {
          module: '系统参数',
          result: 'pending',
          ip: '127.0.0.1',
          summary: '等待审批发布'
        },
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'seed-audit-export-report',
        actorId: adminUserId,
        action: '导出报表',
        resource: 'report',
        resourceId: 'weekly',
        detail: {
          module: '数据报表',
          result: 'success',
          ip: '127.0.0.1',
          summary: '导出本周预约统计'
        },
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
      }
    ]
  });
}

function bookingInput(input: {
  id: string;
  userId: string;
  roomId: string;
  seatId: string;
  startAt: Date;
  endAt: Date;
  status: BookingStatus;
}) {
  return {
    id: input.id,
    userId: input.userId,
    roomId: input.roomId,
    seatId: input.seatId,
    startAt: input.startAt,
    endAt: input.endAt,
    status: input.status,
    createdAt: new Date(input.startAt.getTime() - 40 * 60 * 1000)
  };
}

function floorToSlot(date: Date): Date {
  return new Date(Math.floor(date.getTime() / SLOT_MS) * SLOT_MS);
}

function getShanghaiDayStart(date: Date): Date {
  const shiftedTime = date.getTime() + SHANGHAI_OFFSET_MS;
  return new Date(Math.floor(shiftedTime / DAY_MS) * DAY_MS - SHANGHAI_OFFSET_MS);
}

function getShanghaiWeekStart(date: Date): Date {
  const dayStart = getShanghaiDayStart(date);
  const shanghaiDate = new Date(date.getTime() + SHANGHAI_OFFSET_MS);
  const dayOfWeek = shanghaiDate.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return new Date(dayStart.getTime() - daysSinceMonday * DAY_MS);
}
