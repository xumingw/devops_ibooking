import { StudentViolationRecord } from '@ibooking/shared-types';
import { ViolationRepository, ViolationsService } from './violations.service';

describe('ViolationsService', () => {
  let repository: jest.Mocked<ViolationRepository>;
  let service: ViolationsService;

  beforeEach(() => {
    repository = {
      listByUserId: jest.fn()
    };
    service = new ViolationsService(repository);
  });

  it('汇总当前学生违约记录', async () => {
    const records: StudentViolationRecord[] = [
      {
        id: 'violation-1',
        room: '经管自习室 301 · D8',
        seat: 'D8',
        date: '4月18日',
        reason: '未签到（签到超时自动取消）',
        count: 1,
        status: 'confirmed',
        occurredAt: '2026-04-18T02:15:00.000Z'
      },
      {
        id: 'violation-2',
        room: '理工自习室 201 · A3',
        seat: 'A3',
        date: '2月28日',
        reason: '1小时内取消预约',
        count: 0.5,
        status: 'appealed',
        occurredAt: '2026-02-28T01:30:00.000Z'
      }
    ];
    repository.listByUserId.mockResolvedValue(records);

    await expect(service.getStudentSummary('user-stu-cse-01')).resolves.toEqual({
      totalCount: 1.5,
      restrictionThreshold: 3,
      severeThreshold: 5,
      records
    });
    expect(repository.listByUserId).toHaveBeenCalledWith('user-stu-cse-01');
  });
});
