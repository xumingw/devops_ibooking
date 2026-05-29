import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  StudentNotificationGroupLabel,
  StudentNotificationIconType,
  StudentNotificationRecord,
  StudentNotificationTone
} from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { NotificationRepository } from './notifications.service';

type ReminderLogWithBooking = Prisma.ReminderLogGetPayload<{
  include: {
    booking: {
      include: {
        room: true;
        seat: true;
      };
    };
  };
}>;

@Injectable()
export class PrismaNotificationsRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByUserId(userId: string): Promise<StudentNotificationRecord[]> {
    const rows = await this.prisma.reminderLog.findMany({
      where: { booking: { is: { userId } } },
      include: {
        booking: {
          include: {
            room: true,
            seat: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: 50
    });

    return rows.map((row) => this.toNotification(row));
  }

  private toNotification(row: ReminderLogWithBooking): StudentNotificationRecord {
    const group = this.formatGroup(row.sentAt);
    const meta = this.getReminderMeta(row);
    return {
      id: row.id,
      group,
      iconType: meta.iconType,
      tone: meta.tone,
      title: meta.title,
      description: meta.description,
      timeLabel: this.formatTimeLabel(row.sentAt, group),
      read: group !== '今天',
      occurredAt: row.sentAt.toISOString()
    };
  }

  private getReminderMeta(row: ReminderLogWithBooking): {
    iconType: StudentNotificationIconType;
    tone: StudentNotificationTone;
    title: string;
    description: string;
  } {
    const reminderType = row.type.toLowerCase();
    const roomSeat = `${row.booking.room.name} · ${row.booking.seat.code}`;

    if (reminderType.includes('late') || reminderType.includes('no_checkin')) {
      return {
        iconType: 'clock',
        tone: 'gold',
        title: '未签到提醒',
        description: `您在${roomSeat}的预约已开始 10 分钟，请尽快完成签到`
      };
    }

    if (reminderType.includes('checkin_success') || reminderType.includes('checked_in')) {
      return {
        iconType: 'check',
        tone: 'green',
        title: '签到成功',
        description: `您已完成${roomSeat}签到`
      };
    }

    if (reminderType.includes('cancel') || reminderType.includes('violation')) {
      return {
        iconType: 'alert',
        tone: 'red',
        title: '预约自动取消',
        description: '开始后 15 分钟未签到，座位已释放并记录一次违约'
      };
    }

    return {
      iconType: 'bell',
      tone: 'teal',
      title: '预约提醒',
      description: `您在${roomSeat}的预约将在 15 分钟后开始`
    };
  }

  private formatGroup(date: Date): StudentNotificationGroupLabel {
    const today = new Date();
    if (this.isSameDate(date, today)) return '今天';

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return this.isSameDate(date, yesterday) ? '昨天' : '更早';
  }

  private formatTimeLabel(date: Date, group: StudentNotificationGroupLabel): string {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    if (group === '今天') return `${hour}:${minute}`;
    if (group === '昨天') return `昨天 ${hour}:${minute}`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  private isSameDate(left: Date, right: Date): boolean {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }
}
