import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AdminAuditRecord,
  AdminBookingRecord,
  AdminBookingRecordPage,
  AdminDashboardRecentBooking,
  AdminDashboardRoomStatus,
  AdminDynamicCodeRecord,
  AdminMetric,
  AdminOverviewSnapshot,
  AdminReportTopRoom,
  AdminViolationRecord,
  AdminViolationRecordPage,
  BookingStatus
} from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { AdminOverviewRepository } from './admin-overview.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
const BOOKING_SLOT_MS = 30 * 60 * 1000;
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['PENDING_CHECKIN', 'CHECKED_IN'];
const VALID_BOOKING_STATUSES: BookingStatus[] = [
  'PENDING_CHECKIN',
  'CHECKED_IN',
  'COMPLETED'
];
const REPORT_BOOKING_STATUSES: BookingStatus[] = [
  'PENDING_CHECKIN',
  'CHECKED_IN',
  'COMPLETED',
  'CANCELLED_AUTO_NO_CHECKIN'
];
const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const HEATMAP_HOURS = Array.from({ length: 16 }, (_, index) => `${index + 6}时`);
const STATUS_TONES = {
  navy: '#0F3D32',
  blue: '#3A6FA8',
  green: '#2F9B5F',
  gold: '#D8A72F',
  red: '#C84040',
  purple: '#7A52A8'
};

type RoomWithSeats = Prisma.RoomGetPayload<{
  include: {
    seats: true;
  };
}>;

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    user: true;
    room: true;
    seat: true;
    reminderLogs: true;
    violation: true;
  };
}>;

type ViolationWithRelations = Prisma.ViolationGetPayload<{
  include: {
    booking: true;
    user: true;
    room: true;
    seat: true;
  };
}>;

type CheckInCodeWithRoom = Prisma.CheckInCodeGetPayload<{
  include: {
    room: true;
  };
}>;

type SystemParamRow = Prisma.SystemParamGetPayload<Record<string, never>>;

type AuditLogWithActor = Prisma.AuditLogGetPayload<{
  include: {
    actor: true;
  };
}>;

type OccupiedSlotRow = {
  slotStart: Date;
  seatId: string;
  booking: {
    roomId: string;
  };
};

@Injectable()
export class PrismaAdminOverviewRepository implements AdminOverviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listBookings(query: { page: number; size: number }): Promise<AdminBookingRecordPage> {
    const skip = (query.page - 1) * query.size;
    const [total, bookings] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.findMany({
        include: {
          user: true,
          room: true,
          seat: true,
          reminderLogs: true,
          violation: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.size
      })
    ]);

    return {
      items: bookings.map(toAdminBookingRecord),
      total,
      page: query.page,
      size: query.size
    };
  }

  async listViolations(query: { page: number; size: number }): Promise<AdminViolationRecordPage> {
    const skip = (query.page - 1) * query.size;
    const [total, violations] = await Promise.all([
      this.prisma.violation.count(),
      this.prisma.violation.findMany({
        include: {
          booking: true,
          user: true,
          room: true,
          seat: true
        },
        orderBy: { occurredAt: 'desc' },
        skip,
        take: query.size
      })
    ]);

    return {
      items: violations.map(toAdminViolationRecord),
      total,
      page: query.page,
      size: query.size
    };
  }

  async getSnapshot(now = new Date()): Promise<AdminOverviewSnapshot> {
    const todayStart = getShanghaiDayStart(now);
    const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
    const weekStart = getShanghaiWeekStart(now);
    const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);
    const monthStart = new Date(todayStart.getTime() - 29 * DAY_MS);
    const currentSlotStart = floorToBookingSlot(now);

    const [
      rooms,
      activeSeatCount,
      currentOccupiedCount,
      todayBookingCount,
      validRecentBookingCount,
      checkedRecentBookingCount,
      recentViolationCount,
      recentBookings,
      reportBookings,
      violations,
      checkInCodes,
      params,
      auditLogs,
      activeUserCount,
      adminUserCount,
      disabledUserCount,
      roleCount,
      occupiedSlots
    ] = await Promise.all([
      this.prisma.room.findMany({
        include: { seats: true },
        orderBy: [{ building: 'asc' }, { floor: 'asc' }, { name: 'asc' }]
      }),
      this.prisma.seat.count({
        where: { status: 'ACTIVE', room: { status: 'ACTIVE' } }
      }),
      this.prisma.bookingSlot.count({
        where: {
          slotStart: currentSlotStart,
          booking: { status: { in: ACTIVE_BOOKING_STATUSES } }
        }
      }),
      this.prisma.booking.count({
        where: {
          startAt: { gte: todayStart, lt: tomorrowStart },
          status: { in: REPORT_BOOKING_STATUSES }
        }
      }),
      this.prisma.booking.count({
        where: {
          startAt: { gte: monthStart, lt: tomorrowStart },
          status: { in: VALID_BOOKING_STATUSES }
        }
      }),
      this.prisma.booking.count({
        where: {
          startAt: { gte: monthStart, lt: tomorrowStart },
          status: { in: ['CHECKED_IN', 'COMPLETED'] }
        }
      }),
      this.prisma.violation.count({
        where: {
          occurredAt: { gte: monthStart, lt: tomorrowStart }
        }
      }),
      this.prisma.booking.findMany({
        where: {
          startAt: { gte: monthStart, lt: new Date(tomorrowStart.getTime() + DAY_MS) }
        },
        include: {
          user: true,
          room: true,
          seat: true,
          reminderLogs: true,
          violation: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      this.prisma.booking.findMany({
        where: {
          startAt: { gte: monthStart, lt: tomorrowStart },
          status: { in: VALID_BOOKING_STATUSES }
        },
        include: {
          user: true,
          room: true,
          seat: true,
          reminderLogs: true,
          violation: true
        },
        orderBy: { startAt: 'asc' }
      }),
      this.prisma.violation.findMany({
        include: {
          booking: true,
          user: true,
          room: true,
          seat: true
        },
        orderBy: { occurredAt: 'desc' },
        take: 20
      }),
      this.prisma.checkInCode.findMany({
        include: { room: true },
        orderBy: { createdAt: 'desc' },
        take: 30
      }),
      this.prisma.systemParam.findMany({
        orderBy: { key: 'asc' }
      }),
      this.prisma.auditLog.findMany({
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
        take: 30
      }),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: { code: { in: ['ROLE_FULL_ADMIN', 'ROLE_ROOM_ADMIN', 'ROLE_AUDIT'] } }
            }
          }
        }
      }),
      this.prisma.user.count({ where: { status: 'DISABLED' } }),
      this.prisma.role.count(),
      this.prisma.bookingSlot.findMany({
        where: {
          slotStart: { gte: weekStart, lt: weekEnd },
          booking: { status: { in: VALID_BOOKING_STATUSES } }
        },
        select: {
          slotStart: true,
          seatId: true,
          booking: {
            select: {
              roomId: true
            }
          }
        }
      })
    ]);

    const checkInRate = percentage(checkedRecentBookingCount, validRecentBookingCount);
    const violationRate = percentage(recentViolationCount, Math.max(validRecentBookingCount, 1));
    const openRoomCount = rooms.filter((room) => room.status === 'ACTIVE').length;
    const totalRoomCount = rooms.length;
    const roomStatuses = summarizeRoomStatuses(rooms, occupiedSlots, currentSlotStart);
    const weeklyBookings = summarizeWeeklyBookings(reportBookings, weekStart);

    return {
      dashboard: {
        kpis: [
          metric('今日预约总数', formatInteger(todayBookingCount), 'calendar', STATUS_TONES.navy, '来自预约订单', trendLabel(todayBookingCount)),
          metric('当前在座人数', formatInteger(currentOccupiedCount), 'users', STATUS_TONES.blue, `共 ${formatInteger(activeSeatCount)} 个可用座位`, currentOccupiedCount > 0 ? '实时' : '低峰'),
          metric('签到率', `${checkInRate}%`, 'check-circle', STATUS_TONES.green, '近 30 天有效预约', checkedRecentBookingCount > 0 ? '已同步' : '暂无签到'),
          metric('违约率', `${violationRate}%`, 'alert', STATUS_TONES.gold, '近 30 天违约记录', recentViolationCount > 0 ? `${recentViolationCount} 次` : '无新增'),
          metric('开放自习室', `${openRoomCount} / ${totalRoomCount}`, 'building', STATUS_TONES.purple, '当前资源状态', `${totalRoomCount - openRoomCount} 间停用`)
        ],
        heatmapDays: WEEKDAY_LABELS.map((day) => `周${day}`),
        heatmapHours: HEATMAP_HOURS,
        heatmapData: summarizeHeatmap(occupiedSlots, activeSeatCount, weekStart),
        roomStatuses,
        recentBookings: recentBookings.slice(0, 6).map(toDashboardBooking)
      },
      schedule: {
        summary: [
          metric('开放自习室', `${openRoomCount}`, 'building', STATUS_TONES.green, '当前启用资源'),
          metric('跨天开放', `${rooms.filter((room) => room.overnight).length}`, 'calendar', STATUS_TONES.blue, '支持 24 小时或跨日'),
          metric('维护停用', `${totalRoomCount - openRoomCount}`, 'alert', STATUS_TONES.red, '不会出现在可预约列表')
        ],
        rules: rooms.map(toScheduleRule),
        specialRules: buildScheduleSpecialRules(rooms),
        roomOptions: rooms.map((room) => room.name),
        options: [
          { label: '分钟级时段', desc: '预约搜索按开始、结束时间过滤可用座位', enabled: true },
          { label: '跨天开放', desc: '夜间自习室结束时间早于开始时间时按次日计算', enabled: rooms.some((room) => room.overnight) },
          { label: '停用资源过滤', desc: '停用自习室和座位不会进入学生可预约结果', enabled: true }
        ],
        priorities: [
          { order: '1', title: '自习室独立规则', desc: '单个房间的开放状态和开放时段优先生效' },
          { order: '2', title: '系统参数默认值', desc: '未配置独立规则时使用系统参数中的全校默认规则' },
          { order: '3', title: '资源状态校验', desc: '停用或维护中的资源最终拦截预约提交' }
        ]
      },
      bookings: {
        records: recentBookings.map(toAdminBookingRecord),
        operationRules: [
          ['完整校验', '代预约仍遵守开放时间、冲突、时长、权限规则'],
          ['审计留痕', '记录操作者、目标学生、座位与提交结果'],
          ['代取消', '取消预约必须填写原因并写入操作日志']
        ]
      },
      violations: {
        summary: [
          metric('本月违约', `${recentViolationCount}`, 'alert', STATUS_TONES.red, '近 30 天记录'),
          metric('限制阈值', '3 次', 'shield', STATUS_TONES.gold, '达到后限制预约 7 天'),
          metric('严重阈值', '5 次', 'alert', STATUS_TONES.red, '达到后限制预约 30 天')
        ],
        records: violations.map(toAdminViolationRecord),
        rules: [
          ['开始前 15 分钟提醒', '提醒学生按预约时段到场并准备动态码签到'],
          ['开始后 10 分钟未签到提醒', '仍未签到时再次推送，管理员可在记录中查看'],
          ['开始后 15 分钟自动取消', '释放座位，生成违约记录并进入复核队列'],
          ['连续 3 次违约限制预约', '限制期内仅管理员可人工解除限制']
        ]
      },
      dynamicCodes: {
        summary: [
          metric('今日有效码', `${countActiveCodes(checkInCodes, now)}`, 'qr', STATUS_TONES.green, '按自习室生成'),
          metric('覆盖自习室', `${new Set(checkInCodes.map((row) => row.room.name)).size}`, 'building', STATUS_TONES.blue, '最近生成记录'),
          metric('即将过期', `${countExpiringCodes(checkInCodes, now)}`, 'alert', STATUS_TONES.gold, '需重新生成或等待任务')
        ],
        records: checkInCodes.map((row) => toDynamicCodeRecord(row, now)),
        preview: checkInCodes[0] ? toDynamicCodeRecord(checkInCodes[0], now) : null,
        rules: [
          ['每日 00:00 自动更新', '每间自习室生成当日签到凭证'],
          ['60 秒刷新', '网页动态码按刷新窗口滚动失效'],
          ['截图复用拦截', '同一图片重复提交会进入异常上报'],
          ['操作留痕', '重新生成、打印、查看日志均写入审计']
        ]
      },
      params: {
        summary: [
          metric('单次最长', systemParamLabel(params, 'booking.maxHours', '4 小时'), 'settings', STATUS_TONES.green, '预约时长限制'),
          metric('签到宽限', systemParamLabel(params, 'checkin.graceMinutes', '15 分钟'), 'check-circle', STATUS_TONES.blue, '超过后违约'),
          metric('参数项', `${params.length}`, 'grid', STATUS_TONES.gold, '来自系统参数表')
        ],
        records: params.map(toSystemParamRecord),
        timeline: buildParamTimeline(params),
        scopes: [
          ['全校默认', '所有普通自习室共用的基础规则'],
          ['自习室覆盖', '单间自习室可配置独立开放时间'],
          ['院系范围', '院系自习室仍需校验学生归属']
        ],
        rules: [
          ['参数变更需审批发布', '待发布变更不会立即影响预约规则'],
          ['配置变更需审计留痕', '保存、恢复默认和发布都会进入审计日志'],
          ['违约策略联动签到记录', '自动取消后同步释放座位并生成违约记录']
        ]
      },
      audit: {
        summary: [
          metric('审计日志', `${auditLogs.length}`, 'eye', STATUS_TONES.blue, '最近操作记录'),
          metric('管理员', `${adminUserCount}`, 'shield', STATUS_TONES.green, '已绑定后台角色'),
          metric('停用账号', `${disabledUserCount}`, 'alert', STATUS_TONES.red, '不可登录')
        ],
        records: auditLogs.map(toAuditRecord),
        risks: buildAuditRisks(auditLogs),
        rules: [
          ['关键操作全量留痕', '登录、资源变更、权限调整、代操作均进入审计日志'],
          ['高风险变更需复核', '角色权限和系统参数变更需要审批后生效'],
          ['日志不可由前端篡改', '管理端只读展示后端审计流水']
        ]
      },
      reports: {
        summary: [
          metric('平均签到率', `${checkInRate}%`, 'check-circle', STATUS_TONES.green, '近 30 天'),
          metric('预约总量', formatInteger(validRecentBookingCount), 'calendar', STATUS_TONES.blue, '近 30 天有效预约'),
          metric('角色数', `${roleCount}`, 'shield', STATUS_TONES.gold, `活跃用户 ${activeUserCount}`)
        ],
        weeklyBookings,
        topRooms: summarizeTopRooms(reportBookings),
        topSeats: summarizeTopSeats(reportBookings),
        lowPeriods: summarizeLowPeriods(occupiedSlots, activeSeatCount, weekStart),
        rules: [
          ['报表只读后端聚合', '图表、排行和摘要均基于预约、签到和座位表计算'],
          ['导出需记录审计', 'CSV/Excel 导出应写入操作日志'],
          ['低利用率辅助调度', '管理员可据此调整开放范围或维护计划']
        ]
      }
    };
  }
}

function metric(
  label: string,
  value: string,
  icon: AdminMetric['icon'],
  tone: string,
  note: string,
  trend?: string
): AdminMetric {
  return { label, value, icon, tone, note, trend };
}

function toDashboardBooking(row: BookingWithRelations): AdminDashboardRecentBooking {
  return {
    id: row.id,
    user: row.user.name,
    room: compactRoomName(row.room.name),
    seat: row.seat.code,
    time: formatClockRange(row.startAt, row.endAt),
    status: mapBookingStatus(row.status, Boolean(row.violation))
  };
}

function toAdminBookingRecord(row: BookingWithRelations): AdminBookingRecord {
  const checkInLog = row.reminderLogs.find((log) => log.type === 'CHECK_IN_SUCCESS');
  return {
    id: row.id,
    uid: row.user.studentNo,
    user: row.user.name,
    room: row.room.name,
    seat: row.seat.code,
    date: formatDateLabel(row.startAt),
    time: formatClockRange(row.startAt, row.endAt),
    checkin: checkInLog ? formatClock(checkInLog.sentAt) : '—',
    status: mapBookingStatus(row.status, Boolean(row.violation))
  };
}

function toAdminViolationRecord(row: ViolationWithRelations): AdminViolationRecord {
  return {
    id: row.id,
    bookingId: row.booking.id,
    student: row.user.name,
    uid: row.user.studentNo,
    room: row.room.name,
    seat: row.seat.code,
    reason: row.reason === 'NO_CHECK_IN' ? '未签到' : '人工登记',
    action: row.reason === 'NO_CHECK_IN' ? '自动取消并释放座位' : '管理员处理',
    occurred: formatDateTime(row.occurredAt),
    status: 'confirmed' as const
  };
}

function toDynamicCodeRecord(row: CheckInCodeWithRoom, now: Date): AdminDynamicCodeRecord {
  const remainingMs = row.expiresAt.getTime() - now.getTime();
  const status =
    remainingMs <= 0 ? 'expired' : remainingMs <= 30 * 60 * 1000 ? 'expiring' : 'active';
  return {
    room: row.room.name,
    building: row.room.building,
    webCode: row.code,
    qrStatus: status === 'expired' ? '已过期' : '可打印',
    refresh: '每日更新',
    updatedAt: formatDateTime(row.createdAt),
    status
  };
}

function toSystemParamRecord(row: SystemParamRow) {
  const meta = SYSTEM_PARAM_META[row.key] ?? {
    name: row.key,
    defaultValue: '-',
    scope: '全校',
    note: '后端系统参数'
  };
  return {
    name: meta.name,
    value: formatParamValue(row.key, row.value),
    defaultValue: meta.defaultValue,
    scope: meta.scope,
    type: formatValueType(row.valueType),
    status: 'active' as const,
    note: meta.note
  };
}

function toAuditRecord(row: AuditLogWithActor): AdminAuditRecord {
  const detail = asRecord(row.detail);
  const result = String(detail.result ?? 'success');
  return {
    time: formatDateTime(row.createdAt),
    operator: row.actor?.name ?? '系统',
    module: String(detail.module ?? formatResource(row.resource)),
    action: row.action,
    target: row.resourceId ?? row.resource,
    ip: String(detail.ip ?? 'SYSTEM'),
    result: result === 'failed' ? 'failed' : result === 'pending' ? 'pending' : 'success',
    detail: String(detail.message ?? detail.summary ?? '已记录')
  };
}

function toScheduleRule(room: RoomWithSeats) {
  return {
    room: room.name,
    scope: room.overnight ? '每日' : '工作日',
    time: formatRoomHours(room),
    type: room.status === 'INACTIVE' ? '闭馆维护' : room.overnight ? '跨天开放' : '常规开放',
    status: room.status === 'ACTIVE' ? '已生效' : '停用',
    note: `${room.building} ${room.floor}楼 · ${room.capacity} 座`
  };
}

function buildScheduleSpecialRules(rooms: RoomWithSeats[]) {
  const inactiveRooms = rooms.filter((room) => room.status === 'INACTIVE').slice(0, 3);
  if (inactiveRooms.length > 0) {
    return inactiveRooms.map((room) => ({
      title: `${room.name} 维护`,
      date: '当前',
      target: `${room.building} ${room.floor}楼`,
      time: '暂停开放',
      desc: '资源状态为停用，预约搜索不会返回'
    }));
  }

  return rooms
    .filter((room) => room.overnight)
    .slice(0, 3)
    .map((room) => ({
      title: `${room.name} 跨天开放`,
      date: '当前',
      target: `${room.building} ${room.floor}楼`,
      time: formatRoomHours(room),
      desc: '结束时间早于开始时间时按次日计算'
    }));
}

function summarizeRoomStatuses(
  rooms: RoomWithSeats[],
  occupiedSlots: OccupiedSlotRow[],
  currentSlotStart: Date
): AdminDashboardRoomStatus[] {
  return rooms.slice(0, 8).map((room) => {
    const totalSeats = room.seats.filter((seat) => seat.status === 'ACTIVE').length;
    if (room.status !== 'ACTIVE') {
      return {
        name: room.name,
        pct: 0,
        totalSeats,
        occupiedSeats: 0,
        availableSeats: totalSeats,
        status: 'closed'
      };
    }
    const occupied = new Set(
      occupiedSlots
        .filter(
          (slot) =>
            slot.booking.roomId === room.id &&
            slot.slotStart.getTime() === currentSlotStart.getTime()
        )
        .map((slot) => slot.seatId)
    ).size;
    const pct = totalSeats > 0 ? Math.round((occupied / totalSeats) * 100) : 0;
    return {
      name: room.name,
      pct,
      totalSeats,
      occupiedSeats: occupied,
      availableSeats: Math.max(0, totalSeats - occupied),
      status: pct >= 95 ? 'full' : pct >= 70 ? 'high' : pct >= 35 ? 'mid' : 'low'
    };
  });
}

function summarizeHeatmap(
  occupiedSlots: OccupiedSlotRow[],
  activeSeatCount: number,
  weekStart: Date
): number[][] {
  const matrix = Array.from({ length: 7 }, () => Array.from({ length: HEATMAP_HOURS.length }, () => 0));
  occupiedSlots.forEach((row) => {
    const dayIndex = Math.floor(
      (getShanghaiDayStart(row.slotStart).getTime() - weekStart.getTime()) / DAY_MS
    );
    const hour = getShanghaiHour(row.slotStart);
    const hourIndex = hour - 6;
    if (dayIndex >= 0 && dayIndex < 7 && hourIndex >= 0 && hourIndex < HEATMAP_HOURS.length) {
      matrix[dayIndex][hourIndex] += 1;
    }
  });

  const denominator = Math.max(activeSeatCount, 1);
  return matrix.map((row) => row.map((count) => Math.min(1, Math.round((count / denominator) * 100) / 100)));
}

function summarizeWeeklyBookings(
  bookings: BookingWithRelations[],
  weekStart: Date
): Array<[string, number]> {
  const counts = Array.from({ length: 7 }, () => 0);
  bookings.forEach((booking) => {
    const dayIndex = Math.floor(
      (getShanghaiDayStart(booking.startAt).getTime() - weekStart.getTime()) / DAY_MS
    );
    if (dayIndex >= 0 && dayIndex < 7) counts[dayIndex] += 1;
  });

  return WEEKDAY_LABELS.map((day, index) => [day, counts[index]]);
}

function summarizeTopRooms(bookings: BookingWithRelations[]): AdminReportTopRoom[] {
  const counts = new Map<string, number>();
  bookings.forEach((booking) => {
    counts.set(booking.room.name, (counts.get(booking.room.name) ?? 0) + 1);
  });
  const maxCount = Math.max(...counts.values(), 1);
  return Array.from(counts, ([name, count]) => ({
    name,
    count,
    pct: Math.max(6, Math.round((count / maxCount) * 100))
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function summarizeTopSeats(bookings: BookingWithRelations[]): Array<[string, string, string, string]> {
  const counts = new Map<string, { room: string; count: number; features: Set<string> }>();
  bookings.forEach((booking) => {
    const key = `${booking.room.name}__${booking.seat.code}`;
    const current = counts.get(key) ?? { room: booking.room.name, count: 0, features: new Set<string>() };
    current.count += 1;
    if (booking.seat.hasPower) current.features.add('插座');
    if (booking.seat.nearWindow) current.features.add('靠窗');
    if (asRecord(booking.seat.attributes).quietZone === true) current.features.add('安静区');
    counts.set(key, current);
  });

  return Array.from(counts, ([key, value]) => {
    const seat = key.split('__')[1] ?? key;
    return [
      seat,
      value.room,
      String(value.count),
      Array.from(value.features).join('、') || '普通座位'
    ] as [string, string, string, string];
  })
    .sort((a, b) => Number(b[2]) - Number(a[2]))
    .slice(0, 8);
}

function summarizeLowPeriods(
  occupiedSlots: OccupiedSlotRow[],
  activeSeatCount: number,
  weekStart: Date
): Array<[string, string, string]> {
  const heatmap = summarizeHeatmap(occupiedSlots, activeSeatCount, weekStart);
  const periods = HEATMAP_HOURS.map((hour, hourIndex) => {
    const avg =
      heatmap.reduce((sum, row) => sum + (row[hourIndex] ?? 0), 0) / Math.max(heatmap.length, 1);
    return {
      hour,
      pct: Math.round(avg * 100)
    };
  });
  return periods
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4)
    .map((period) => [period.hour, `${period.pct}%`, period.pct < 10 ? '低峰' : '可优化']);
}

function buildParamTimeline(params: SystemParamRow[]): Array<[string, string, string]> {
  return [
    ['预约前', '开始前提醒', `提前 ${systemParamLabel(params, 'reminder.beforeStartMinutes', '15 分钟')} 推送通知`],
    ['预约开始', '允许签到', `动态码校验后进入使用中状态`],
    ['未签到', '自动取消', `超过 ${systemParamLabel(params, 'checkin.graceMinutes', '15 分钟')} 自动释放座位`]
  ];
}

function buildAuditRisks(auditLogs: AuditLogWithActor[]): Array<[string, string, string]> {
  const failedLogs = auditLogs.filter((log) => asRecord(log.detail).result === 'failed');
  const pendingLogs = auditLogs.filter((log) => asRecord(log.detail).result === 'pending');
  return [
    ['失败操作', `${failedLogs.length} 条`, '需确认是否存在越权或重复操作'],
    ['待复核变更', `${pendingLogs.length} 条`, '高风险权限或参数变更需要审批'],
    ['最近操作', `${auditLogs.length} 条`, '来自后端审计日志表']
  ];
}

function mapBookingStatus(
  status: BookingStatus,
  hasViolation: boolean
): AdminDashboardRecentBooking['status'] {
  if (hasViolation || status === 'CANCELLED_AUTO_NO_CHECKIN') return 'violation';
  if (status === 'CHECKED_IN') return 'active';
  if (status === 'COMPLETED') return 'done';
  if (status === 'PENDING_CHECKIN') return 'pending';
  return 'cancelled';
}

const SYSTEM_PARAM_META: Record<string, { name: string; defaultValue: string; scope: string; note: string }> = {
  'booking.maxHours': {
    name: '最大预约时长',
    defaultValue: '4 小时',
    scope: '全校',
    note: '单次预约最长时长'
  },
  'checkin.graceMinutes': {
    name: '签到宽限时间',
    defaultValue: '15 分钟',
    scope: '全校',
    note: '超过后自动取消并记录违约'
  },
  'reminder.beforeStartMinutes': {
    name: '开始前提醒',
    defaultValue: '15 分钟',
    scope: '全校',
    note: '预约开始前通知学生'
  },
  'reminder.afterStartMinutes': {
    name: '未签到提醒',
    defaultValue: '10 分钟',
    scope: '全校',
    note: '预约开始后仍未签到时提醒'
  },
  'violation.restrictDays': {
    name: '违约限制天数',
    defaultValue: '7 天',
    scope: '全校',
    note: '达到 3 次违约后的限制期'
  }
};

function systemParamLabel(params: SystemParamRow[], key: string, fallback: string): string {
  const row = params.find((param) => param.key === key);
  return row ? formatParamValue(row.key, row.value) : fallback;
}

function formatParamValue(key: string, value: string): string {
  if (key.includes('Hours')) return `${value} 小时`;
  if (key.includes('Minutes')) return `${value} 分钟`;
  if (key.includes('Days')) return `${value} 天`;
  return value;
}

function formatValueType(valueType: string): string {
  if (valueType === 'number') return '数字';
  if (valueType === 'boolean') return '开关';
  return '文本';
}

function countActiveCodes(codes: CheckInCodeWithRoom[], now: Date): number {
  return codes.filter((code) => code.validAt <= now && code.expiresAt > now).length;
}

function countExpiringCodes(codes: CheckInCodeWithRoom[], now: Date): number {
  return codes.filter((code) => {
    const remainingMs = code.expiresAt.getTime() - now.getTime();
    return remainingMs > 0 && remainingMs <= 30 * 60 * 1000;
  }).length;
}

function formatRoomHours(room: Pick<RoomWithSeats, 'openHour' | 'closeHour' | 'overnight'>): string {
  const open = `${String(room.openHour).padStart(2, '0')}:00`;
  const close = room.closeHour === 24 ? '24:00' : `${String(room.closeHour).padStart(2, '0')}:00`;
  return room.overnight ? `${open}–${close}（跨天）` : `${open}–${close}`;
}

function compactRoomName(name: string): string {
  return name.replace('自习室 ', '').replace('自习区', '区');
}

function formatResource(resource: string): string {
  const labels: Record<string, string> = {
    room: '自习室管理',
    seat: '座位管理',
    booking: '预约记录',
    role: '角色权限',
    system_param: '系统参数',
    check_in_code: '动态码管理'
  };
  return labels[resource] ?? resource;
}

function trendLabel(value: number): string {
  return value > 0 ? '今日有预约' : '今日暂无';
}

function formatInteger(value: number): string {
  return value.toLocaleString('zh-CN');
}

function percentage(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function floorToBookingSlot(date: Date): Date {
  return new Date(Math.floor(date.getTime() / BOOKING_SLOT_MS) * BOOKING_SLOT_MS);
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

function getShanghaiHour(date: Date): number {
  return new Date(date.getTime() + SHANGHAI_OFFSET_MS).getUTCHours();
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Shanghai'
  }).format(date);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  }).format(date);
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  }).format(date);
}

function formatClockRange(startAt: Date, endAt: Date): string {
  return `${formatClock(startAt)}–${formatClock(endAt)}`;
}

function asRecord(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
