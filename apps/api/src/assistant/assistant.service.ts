import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  StudentAssistantBookingCandidate,
  StudentAssistantIntent,
  StudentAssistantReply,
  StudentAssistantSeatCandidate
} from '@ibooking/shared-types';

export const ASSISTANT_REPOSITORY = 'ASSISTANT_REPOSITORY';
export const ASSISTANT_MODEL_CLIENT = 'ASSISTANT_MODEL_CLIENT';

export type AssistantSeatFilters = {
  hasPower: boolean;
  nearWindow: boolean;
  quietZone: boolean;
};

export type AssistantTimeRange = {
  startAt: Date;
  endAt: Date;
};

export type FindAvailableSeatsInput = {
  userId: string;
  departmentId: string | null;
  filters: AssistantSeatFilters;
  timeRange: AssistantTimeRange;
  timeLabel: string;
};

export type ListAssistantBookingsInput = {
  userId: string;
  targetDate: Date;
  dateLabel: '今天' | '明天';
};

export type FindRoomHoursInput = {
  departmentId: string | null;
  keyword: string;
  targetDate: Date;
};

export type AssistantRoomHoursCandidate = {
  room: string;
  location: string;
  openHour: number;
  closeHour: number;
  overnight: boolean;
  closed: boolean;
};

export interface AssistantRepository {
  findAvailableSeats(input: FindAvailableSeatsInput): Promise<StudentAssistantSeatCandidate[]>;
  findRoomHours(input: FindRoomHoursInput): Promise<AssistantRoomHoursCandidate[]>;
  listBookingsByUserId(
    input: ListAssistantBookingsInput
  ): Promise<StudentAssistantBookingCandidate[]>;
}

export type AssistantModelInput = {
  message: string;
  now: Date;
};

export type AssistantModelDecision = {
  intent: StudentAssistantIntent;
  dateLabel: '今天' | '明天';
  timeLabel: string;
  startHour: number;
  endHour: number;
  filters: AssistantSeatFilters;
  fallbackText: string;
};

export interface AssistantModelClient {
  interpret(input: AssistantModelInput): Promise<AssistantModelDecision>;
}

export type AssistantReplyInput = {
  userId: string;
  departmentId: string | null;
  message: string;
};

type ShanghaiDateParts = {
  year: number;
  month: number;
  day: number;
};

const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

@Injectable()
export class AssistantService {
  constructor(
    @Inject(ASSISTANT_REPOSITORY) private readonly repository: AssistantRepository,
    @Inject(ASSISTANT_MODEL_CLIENT) private readonly modelClient: AssistantModelClient
  ) {}

  async reply(input: AssistantReplyInput): Promise<StudentAssistantReply> {
    const roomHoursQuery = this.resolveRoomHoursQuery(input.message);
    if (roomHoursQuery) {
      return this.replyWithRoomHours(input.departmentId, roomHoursQuery);
    }

    const decision = await this.resolveDecision(input.message);

    if (decision.intent === 'my_bookings') {
      return this.replyWithMyBookings(input.userId, decision);
    }
    if (decision.intent === 'availability' || decision.intent === 'seat_search') {
      return this.replyWithSeats(input, decision);
    }
    return this.fallbackReply(decision.fallbackText);
  }

  private async resolveDecision(message: string): Promise<AssistantModelDecision> {
    try {
      return await this.modelClient.interpret({
        message,
        now: new Date()
      });
    } catch (error) {
      if (this.isModelNotConfigured(error)) {
        return this.interpretWithKeywords(message);
      }
      throw error;
    }
  }

  private isModelNotConfigured(error: unknown): boolean {
    if (!(error instanceof ServiceUnavailableException)) return false;
    const response = error.getResponse();
    if (typeof response === 'string') return response.includes('智能助手模型未配置');
    return (
      typeof response === 'object' &&
      response !== null &&
      'message' in response &&
      String(response.message).includes('智能助手模型未配置')
    );
  }

  private interpretWithKeywords(message: string): AssistantModelDecision {
    const normalized = message.trim();
    const dateLabel: '今天' | '明天' = /明天/.test(normalized) ? '明天' : '今天';
    const filters = {
      hasPower: /插座|电源|充电/.test(normalized),
      nearWindow: /靠窗|窗边|窗户/.test(normalized),
      quietZone: /安静|低噪|静音/.test(normalized)
    };
    const timeRange = this.resolveKeywordTimeRange(normalized, dateLabel);
    const asksBookings = /我的预约|我.*(定|订|预约).*哪|我今天定了哪里|我今天订了哪里/.test(
      normalized
    );
    const asksSeat = /座位|找座|靠窗|窗边|插座|电源|安静|低噪|静音/.test(normalized);
    const asksAvailability = /空座|空位|有座|还有.*座|有没有.*座/.test(normalized);

    return {
      intent: asksBookings
        ? 'my_bookings'
        : asksSeat
          ? 'seat_search'
          : asksAvailability
            ? 'availability'
            : 'fallback',
      dateLabel,
      timeLabel: timeRange.timeLabel,
      startHour: timeRange.startHour,
      endHour: timeRange.endHour,
      filters,
      fallbackText: '当前使用关键词规则，我能帮你查空座、按条件找座、查看我的预约。'
    };
  }

  private resolveKeywordTimeRange(message: string, dateLabel: '今天' | '明天') {
    if (/晚上|今晚/.test(message)) {
      return { timeLabel: `${dateLabel}晚上`, startHour: 18, endHour: 22 };
    }
    if (/下午/.test(message)) {
      return { timeLabel: `${dateLabel}下午`, startHour: 14, endHour: 18 };
    }
    if (/上午|早上/.test(message)) {
      return { timeLabel: `${dateLabel}上午`, startHour: 8, endHour: 12 };
    }
    return { timeLabel: `${dateLabel}全天`, startHour: 8, endHour: 22 };
  }

  private resolveRoomHoursQuery(message: string): { keyword: string; dateLabel: '今天' | '明天' } | null {
    const normalized = message.trim();
    const asksHours =
      /开放时间|营业时间|什么时候.*(关门|关|闭馆|关闭|开门|开放)|几点.*(关门|关|闭馆|关闭|开门|开放)|关门|闭馆/.test(
        normalized
      );
    if (!asksHours) return null;

    const keyword = normalized
      .replace(/[?？。！!]/g, '')
      .replace(/今天|明天|请问|帮我查|帮我看|什么时候|几点|开放时间|营业时间|关门|关|闭馆|关闭|开门|开放|吗|呢|的/g, '')
      .trim();

    return {
      keyword: keyword || '自习室',
      dateLabel: /明天/.test(normalized) ? '明天' : '今天'
    };
  }

  private async replyWithRoomHours(
    departmentId: string | null,
    query: { keyword: string; dateLabel: '今天' | '明天' }
  ): Promise<StudentAssistantReply> {
    const rooms = await this.repository.findRoomHours({
      departmentId,
      keyword: query.keyword,
      targetDate: this.createTargetDate(query.dateLabel)
    });
    const text =
      rooms.length > 0
        ? rooms
            .map((room) =>
              room.closed
                ? `${room.room}（${room.location}）${query.dateLabel}闭馆。`
                : `${room.room}（${room.location}）${this.formatRoomHours(room)}，${this.formatHour(room.closeHour)} 关闭。`
            )
            .join('\n')
        : `没有找到“${query.keyword}”对应的开放时间，可以换成具体自习室名称再问。`;

    return {
      intent: 'fallback',
      text,
      seats: [],
      bookings: [],
      suggestions: ['查今天空座', '换个自习室', '查看我的预约']
    };
  }

  private async replyWithSeats(
    input: AssistantReplyInput,
    decision: AssistantModelDecision
  ): Promise<StudentAssistantReply> {
    const timeRange = this.createTimeRange(decision);
    const timeLabel = this.formatTimeRangeLabel(decision.dateLabel, timeRange);
    const seats = await this.repository.findAvailableSeats({
      userId: input.userId,
      departmentId: input.departmentId,
      filters: decision.filters,
      timeRange,
      timeLabel
    });
    const conditionLabel = this.formatSeatCondition(decision.filters);
    const conditionText = conditionLabel ? `，符合${conditionLabel}条件` : '';
    const text =
      seats.length > 0
        ? `${timeLabel}${conditionText}找到 ${seats.length} 个可用座位。`
        : `${timeLabel}${conditionText}暂时没有可用座位，可以换个时段或放宽条件。`;

    return {
      intent: decision.intent,
      text,
      seats,
      bookings: [],
      suggestions: ['换个时段', '去选座页筛选', '我今天定了哪里']
    };
  }

  private async replyWithMyBookings(
    userId: string,
    decision: AssistantModelDecision
  ): Promise<StudentAssistantReply> {
    const bookings = await this.repository.listBookingsByUserId({
      userId,
      targetDate: this.createTargetDate(decision.dateLabel),
      dateLabel: decision.dateLabel
    });
    const text =
      bookings.length > 0
        ? `找到你的${decision.dateLabel === '今天' ? '今日' : '明日'}预约 ${bookings.length} 条。`
        : `${decision.dateLabel === '今天' ? '今日' : '明日'}暂无预约。`;

    return {
      intent: 'my_bookings',
      text,
      seats: [],
      bookings,
      suggestions: ['查看我的预约', '今晚还有空座吗']
    };
  }

  private fallbackReply(text?: string): StudentAssistantReply {
    return {
      intent: 'fallback',
      text: text || '我能帮你查空座、按条件找座、查看我的预约。可以试试下面的问题。',
      seats: [],
      bookings: [],
      suggestions: ['今晚还有空座吗', '找靠窗座位', '我今天定了哪里']
    };
  }

  private createTargetDate(dateLabel: '今天' | '明天'): Date {
    return this.createShanghaiDateTime(this.getShanghaiDateParts(new Date(), dateLabel === '明天' ? 1 : 0), 0);
  }

  private createTimeRange(decision: AssistantModelDecision): AssistantTimeRange {
    const targetDateParts = this.getShanghaiDateParts(
      new Date(),
      decision.dateLabel === '明天' ? 1 : 0
    );
    const startAt = this.createShanghaiDateTime(
      targetDateParts,
      this.normalizeHour(decision.startHour, 8)
    );
    const endAt = this.createShanghaiDateTime(
      targetDateParts,
      this.normalizeHour(decision.endHour, 22)
    );
    this.normalizeFutureStart(startAt);
    this.normalizeEndWithinBookingLimit(startAt, endAt);
    return { startAt, endAt };
  }

  private normalizeFutureStart(startAt: Date): void {
    const now = new Date();
    if (startAt.getTime() > now.getTime()) return;
    startAt.setTime(this.ceilShanghaiNowToNextHour(now).getTime());
  }

  private normalizeEndWithinBookingLimit(startAt: Date, endAt: Date): void {
    const maxEndAt = new Date(startAt);
    maxEndAt.setHours(maxEndAt.getHours() + 4);
    if (endAt.getTime() <= startAt.getTime() || endAt.getTime() > maxEndAt.getTime()) {
      endAt.setTime(maxEndAt.getTime());
    }
  }

  private normalizeHour(hour: number, fallback: number): number {
    return Number.isInteger(hour) && hour >= 0 && hour <= 24 ? hour : fallback;
  }

  private formatSeatCondition(filters: AssistantSeatFilters): string {
    return [
      filters.nearWindow ? '靠窗' : '',
      filters.hasPower ? '插座' : '',
      filters.quietZone ? '安静区' : ''
    ]
      .filter(Boolean)
      .join('、');
  }

  private formatTimeRangeLabel(
    dateLabel: '今天' | '明天',
    timeRange: AssistantTimeRange
  ): string {
    return `${this.formatRelativeShanghaiDateLabel(timeRange.startAt, dateLabel)} ${this.formatClock(timeRange.startAt)}-${this.formatClock(timeRange.endAt)}`;
  }

  private formatClock(date: Date): string {
    const clock = this.getShanghaiClockParts(date);
    return `${String(clock.hour).padStart(2, '0')}:${String(clock.minute).padStart(2, '0')}`;
  }

  private formatRoomHours(room: Pick<AssistantRoomHoursCandidate, 'openHour' | 'closeHour' | 'overnight'>): string {
    const closePrefix = room.overnight ? '次日 ' : '';
    return `${this.formatHour(room.openHour)}-${closePrefix}${this.formatHour(room.closeHour)}`;
  }

  private formatHour(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }

  private ceilShanghaiNowToNextHour(now: Date): Date {
    const parts = this.getShanghaiDateParts(now, 0);
    const clock = this.getShanghaiClockParts(now);
    const shouldRoundUp = clock.minute > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0;
    return this.createShanghaiDateTime(parts, clock.hour + (shouldRoundUp ? 1 : 0));
  }

  private formatRelativeShanghaiDateLabel(
    date: Date,
    fallback: '今天' | '明天',
    now = new Date()
  ): string {
    const targetKey = this.getShanghaiDateKey(date);
    const todayKey = this.formatShanghaiDateKey(this.getShanghaiDateParts(now, 0));
    const tomorrowKey = this.formatShanghaiDateKey(this.getShanghaiDateParts(now, 1));
    const dayAfterTomorrowKey = this.formatShanghaiDateKey(this.getShanghaiDateParts(now, 2));
    if (targetKey === todayKey) return '今天';
    if (targetKey === tomorrowKey) return '明天';
    if (targetKey === dayAfterTomorrowKey) return '后天';
    const parts = this.getShanghaiDateParts(date, 0);
    return fallback || `${parts.month}月${parts.day}日`;
  }

  private getShanghaiDateKey(date: Date): string {
    return this.formatShanghaiDateKey(this.getShanghaiDateParts(date, 0));
  }

  private formatShanghaiDateKey(parts: ShanghaiDateParts): string {
    return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  }

  private getShanghaiDateParts(date: Date, dayOffset: number): ShanghaiDateParts {
    const shanghaiDate = new Date(date.getTime() + SHANGHAI_OFFSET_MS);
    shanghaiDate.setUTCDate(shanghaiDate.getUTCDate() + dayOffset);
    return {
      year: shanghaiDate.getUTCFullYear(),
      month: shanghaiDate.getUTCMonth() + 1,
      day: shanghaiDate.getUTCDate()
    };
  }

  private getShanghaiClockParts(date: Date): { hour: number; minute: number } {
    const shanghaiDate = new Date(date.getTime() + SHANGHAI_OFFSET_MS);
    return {
      hour: shanghaiDate.getUTCHours(),
      minute: shanghaiDate.getUTCMinutes()
    };
  }

  private createShanghaiDateTime(parts: ShanghaiDateParts, hour: number, minute = 0): Date {
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hour - 8, minute, 0, 0));
  }
}
