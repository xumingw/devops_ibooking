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

export interface AssistantRepository {
  findAvailableSeats(input: FindAvailableSeatsInput): Promise<StudentAssistantSeatCandidate[]>;
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

@Injectable()
export class AssistantService {
  constructor(
    @Inject(ASSISTANT_REPOSITORY) private readonly repository: AssistantRepository,
    @Inject(ASSISTANT_MODEL_CLIENT) private readonly modelClient: AssistantModelClient
  ) {}

  async reply(input: AssistantReplyInput): Promise<StudentAssistantReply> {
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
    const value = new Date();
    if (dateLabel === '明天') value.setDate(value.getDate() + 1);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private createTimeRange(decision: AssistantModelDecision): AssistantTimeRange {
    const targetDate = this.createTargetDate(decision.dateLabel);
    const startAt = new Date(targetDate);
    startAt.setHours(this.normalizeHour(decision.startHour, 8), 0, 0, 0);
    const endAt = new Date(targetDate);
    endAt.setHours(this.normalizeHour(decision.endHour, 22), 0, 0, 0);
    this.normalizeFutureStart(startAt);
    this.normalizeEndWithinBookingLimit(startAt, endAt);
    return { startAt, endAt };
  }

  private normalizeFutureStart(startAt: Date): void {
    const now = new Date();
    if (startAt.getTime() > now.getTime()) return;
    startAt.setTime(now.getTime());
    startAt.setMinutes(0, 0, 0);
    if (now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0) {
      startAt.setHours(startAt.getHours() + 1);
    }
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
    return `${dateLabel} ${this.formatClock(timeRange.startAt)}-${this.formatClock(timeRange.endAt)}`;
  }

  private formatClock(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}
