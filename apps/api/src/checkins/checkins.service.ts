import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ErrorCode, StudentCheckInResult, StudentCheckInSession } from '@ibooking/shared-types';

export const CHECK_IN_REPOSITORY = 'CHECK_IN_REPOSITORY';

export interface CheckInRepository {
  findCurrentByUserId(userId: string): Promise<StudentCheckInSession | null>;
  verifyCode(input: { roomId: string; code: string }): Promise<boolean>;
  markCheckedIn(input: { bookingId: string; userId: string }): Promise<StudentCheckInResult>;
}

@Injectable()
export class CheckInsService {
  constructor(@Inject(CHECK_IN_REPOSITORY) private readonly repository: CheckInRepository) {}

  getCurrentSession(userId: string): Promise<StudentCheckInSession | null> {
    return this.repository.findCurrentByUserId(userId);
  }

  async submitCode(userId: string, code: string): Promise<StudentCheckInResult> {
    const normalizedCode = code.trim();
    if (!/^\d{6}$/.test(normalizedCode)) {
      throw new BadRequestException({
        code: ErrorCode.INVALID_CODE,
        message: '动态码必须是 6 位数字',
      });
    }

    const session = await this.repository.findCurrentByUserId(userId);
    if (!session) {
      throw new BadRequestException({
        code: ErrorCode.CHECK_IN_OUT_OF_WINDOW,
        message: '当前没有可签到预约',
      });
    }

    const valid = await this.repository.verifyCode({
      roomId: session.roomId,
      code: normalizedCode,
    });
    if (!valid) {
      throw new BadRequestException({
        code: ErrorCode.INVALID_CODE,
        message: '动态码无效或已过期',
      });
    }

    return this.repository.markCheckedIn({ bookingId: session.bookingId, userId });
  }
}
