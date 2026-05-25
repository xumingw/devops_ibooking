// @story US2.2.1
// @tc TC-US2.2.1-01
import { ErrorCode } from '@ibooking/shared-types';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { SeatsStore } from './seats.store';

describe('US2.2.1 座位管理最小功能', () => {
  let controller: SeatsController;

  beforeEach(() => {
    controller = new SeatsController(new SeatsService(new SeatsStore()));
  });

  it('TC-US2.2.1-01: 新增、编辑、注销和恢复座位', () => {
    const created = controller.create('room_101', { code: 'A001', x: 1, y: 2 });

    expect(created).toMatchObject({
      roomId: 'room_101',
      code: 'A001',
      status: 'ACTIVE',
    });
    expect(controller.list('room_101')).toHaveLength(1);

    expect(() => controller.create('room_101', { code: 'A001', x: 2, y: 3 })).toThrow(
      expect.objectContaining({
        response: expect.objectContaining({ code: ErrorCode.SEAT_CODE_DUPLICATE }),
      }),
    );

    const updated = controller.update(created.id, { code: 'A002', x: 4 });
    expect(updated).toMatchObject({ code: 'A002', x: 4, y: 2 });

    expect(controller.updateStatus(created.id, { status: 'INACTIVE' })).toMatchObject({
      status: 'INACTIVE',
    });
    expect(controller.updateStatus(created.id, { status: 'ACTIVE' })).toMatchObject({
      status: 'ACTIVE',
    });
  });
});
