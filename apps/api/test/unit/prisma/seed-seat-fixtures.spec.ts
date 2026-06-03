import { createStudentRoomSeatFixtures } from '../../../prisma/seed-seat-fixtures';

describe('student room seat seed fixtures', () => {
  it('生成前端平面图会提交的座位 ID', () => {
    const fixtures = createStudentRoomSeatFixtures(['room-gm-301', 'room-science-201']);

    expect(fixtures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'seat-gm-301-a1',
          roomId: 'room-gm-301',
          code: 'A1',
          hasPower: true
        }),
        expect.objectContaining({
          id: 'seat-gm-301-c3',
          roomId: 'room-gm-301',
          code: 'C3'
        }),
        expect.objectContaining({
          id: 'seat-science-201-c3',
          roomId: 'room-science-201',
          code: 'C3'
        })
      ])
    );
  });
});
