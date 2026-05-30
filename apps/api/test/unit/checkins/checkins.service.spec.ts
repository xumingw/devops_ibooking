import { BadRequestException } from '@nestjs/common';
import { StudentCheckInResult, StudentCheckInSession } from '@ibooking/shared-types';
import { CheckInRepository, CheckInsService } from '../../../src/checkins/checkins.service';

describe('CheckInsService', () => {
  let repository: jest.Mocked<CheckInRepository>;
  let service: CheckInsService;

  beforeEach(() => {
    repository = {
      findCurrentByUserId: jest.fn(),
      markCheckedIn: jest.fn(),
      verifyCode: jest.fn(),
    };
    service = new CheckInsService(repository);
  });

  it('返回当前学生可签到预约', async () => {
    const session = checkInSessionFixture();
    repository.findCurrentByUserId.mockResolvedValue(session);

    await expect(service.getCurrentSession('user-stu-cse-01')).resolves.toEqual(session);
    expect(repository.findCurrentByUserId).toHaveBeenCalledWith('user-stu-cse-01');
  });

  it('校验动态码后将预约状态改为已签到', async () => {
    const session = checkInSessionFixture();
    const result: StudentCheckInResult = {
      bookingId: session.bookingId,
      room: session.room,
      seat: session.seat,
      time: session.time,
      checkedInAt: '2026-05-30T06:02:00.000Z',
      status: 'CHECKED_IN',
    };
    repository.findCurrentByUserId.mockResolvedValue(session);
    repository.verifyCode.mockResolvedValue(true);
    repository.markCheckedIn.mockResolvedValue(result);

    await expect(service.submitCode('user-stu-cse-01', '274159')).resolves.toEqual(result);
    expect(repository.verifyCode).toHaveBeenCalledWith({
      roomId: 'room-gm-301',
      code: '274159',
    });
    expect(repository.markCheckedIn).toHaveBeenCalledWith({
      bookingId: session.bookingId,
      userId: 'user-stu-cse-01',
    });
  });

  it('动态码无效时拒绝签到', async () => {
    repository.findCurrentByUserId.mockResolvedValue(checkInSessionFixture());
    repository.verifyCode.mockResolvedValue(false);

    await expect(service.submitCode('user-stu-cse-01', '000000')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.markCheckedIn).not.toHaveBeenCalled();
  });
});

function checkInSessionFixture(): StudentCheckInSession {
  return {
    bookingId: 'booking-current',
    roomId: 'room-gm-301',
    room: '经管自习室 301',
    seat: 'C3',
    time: '今日 14:00-17:00',
    remainingSeconds: 562,
    codeLength: 6,
  };
}
