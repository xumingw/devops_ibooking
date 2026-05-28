import { Injectable } from '@nestjs/common';
import { ViolationReason } from '@prisma/client';
import { StudentViolationRecord } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { ViolationRepository } from './violations.service';

@Injectable()
export class PrismaViolationsRepository implements ViolationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByUserId(userId: string): Promise<StudentViolationRecord[]> {
    const rows = await this.prisma.violation.findMany({
      where: { userId },
      include: {
        room: true,
        seat: true
      },
      orderBy: { occurredAt: 'desc' }
    });

    return rows.map((row) => ({
      id: row.id,
      room: `${row.room.name} · ${row.seat.code}`,
      seat: row.seat.code,
      date: this.formatDate(row.occurredAt),
      reason: this.formatReason(row.reason),
      count: 1,
      status: 'confirmed',
      occurredAt: row.occurredAt.toISOString()
    }));
  }

  private formatReason(reason: ViolationReason): string {
    return reason === 'NO_CHECK_IN' ? '未签到（签到超时自动取消）' : '管理员记录违约';
  }

  private formatDate(date: Date): string {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
}
