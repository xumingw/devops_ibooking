import { StudentNotificationRecord } from '@ibooking/shared-types';
import { NotificationRepository, NotificationsService } from '../../../src/notifications/notifications.service';

describe('NotificationsService', () => {
  let repository: jest.Mocked<NotificationRepository>;
  let service: NotificationsService;

  beforeEach(() => {
    repository = {
      listByUserId: jest.fn(),
      markAllReadByUserId: jest.fn()
    } as jest.Mocked<NotificationRepository>;
    service = new NotificationsService(repository);
  });

  it('汇总当前学生通知并按日期分组计算未读数', async () => {
    const records: StudentNotificationRecord[] = [
      notificationFixture({
        id: 'notice-booking-start',
        group: '今天',
        iconType: 'bell',
        tone: 'teal',
        title: '预约提醒',
        description: '您今日 14:00 在经管自习室 301 的预约将在 15 分钟后开始',
        timeLabel: '13:45',
        read: false
      }),
      notificationFixture({
        id: 'notice-checkin-late',
        group: '今天',
        iconType: 'clock',
        tone: 'gold',
        title: '未签到提醒',
        description: '预约已开始 10 分钟，请尽快完成签到',
        timeLabel: '14:10',
        read: false
      }),
      notificationFixture({
        id: 'notice-checkin-done',
        group: '昨天',
        iconType: 'check',
        tone: 'green',
        title: '签到成功',
        description: '您已完成经管自习室 301 · C3 签到',
        timeLabel: '昨天 13:52',
        read: true
      }),
      notificationFixture({
        id: 'notice-violation',
        group: '更早',
        iconType: 'alert',
        tone: 'red',
        title: '违约记录',
        description: '开始后 15 分钟未签到，座位已释放并记录一次违约',
        timeLabel: '4月18日',
        read: true
      })
    ];
    repository.listByUserId.mockResolvedValue(records);

    await expect(service.getStudentSummary('user-stu-cse-01')).resolves.toEqual({
      unreadCount: 2,
      groups: [
        { date: '今天', items: [records[0], records[1]] },
        { date: '昨天', items: [records[2]] },
        { date: '更早', items: [records[3]] }
      ]
    });
    expect(repository.listByUserId).toHaveBeenCalledWith('user-stu-cse-01');
  });

  it('标记全部已读会写入仓储并返回重新汇总后的未读数', async () => {
    const records: StudentNotificationRecord[] = [
      notificationFixture({
        id: 'notice-booking-start',
        group: '今天',
        iconType: 'bell',
        tone: 'teal',
        title: '预约提醒',
        description: '您今日 14:00 在经管自习室 301 的预约将在 15 分钟后开始',
        timeLabel: '13:45',
        read: true
      })
    ];
    repository.listByUserId.mockResolvedValue(records);

    await expect(service.markAllRead('user-stu-cse-01')).resolves.toEqual({
      unreadCount: 0,
      groups: [{ date: '今天', items: records }]
    });
    expect(repository.markAllReadByUserId).toHaveBeenCalledWith('user-stu-cse-01');
    expect(repository.listByUserId).toHaveBeenCalledWith('user-stu-cse-01');
  });
});

function notificationFixture(
  input: Omit<StudentNotificationRecord, 'occurredAt'>
): StudentNotificationRecord {
  return {
    ...input,
    occurredAt: '2026-05-29T05:45:00.000Z'
  };
}
