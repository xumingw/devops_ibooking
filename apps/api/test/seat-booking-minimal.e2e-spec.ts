// @story US2.2.1
// @tc TC-US2.2.1-01
// @story US3.4.2
// @tc TC-US3.4.2-01
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ErrorCode } from '@ibooking/shared-types';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { bookingsStore } from '../src/bookings/bookings.store';
import { seatsStore } from '../src/seats/seats.store';

describe('成员 B 座位管理 + 成员 C 预约签到最小接口', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.listen(0, '127.0.0.1');
  });

  beforeEach(() => {
    seatsStore.clear();
    bookingsStore.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('成员 B: 新增、重复编号、编辑、注销和恢复座位', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/rooms/room_101/seats')
      .send({ code: 'A001', x: 1, y: 2 })
      .expect(201);

    expect(created.body.data).toMatchObject({
      roomId: 'room_101',
      code: 'A001',
      status: 'ACTIVE',
    });

    const duplicate = await request(app.getHttpServer())
      .post('/api/v1/rooms/room_101/seats')
      .send({ code: 'A001', x: 2, y: 3 })
      .expect(409);
    expect(duplicate.body.code).toBe(ErrorCode.SEAT_CODE_DUPLICATE);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/seats/${created.body.data.id}`)
      .send({ code: 'A002', x: 4 })
      .expect(200);
    expect(updated.body.data).toMatchObject({ code: 'A002', x: 4, y: 2 });

    const inactive = await request(app.getHttpServer())
      .patch(`/api/v1/seats/${created.body.data.id}/status`)
      .send({ status: 'INACTIVE' })
      .expect(200);
    expect(inactive.body.data.status).toBe('INACTIVE');

    const active = await request(app.getHttpServer())
      .patch(`/api/v1/seats/${created.body.data.id}/status`)
      .send({ status: 'ACTIVE' })
      .expect(200);
    expect(active.body.data.status).toBe('ACTIVE');
  });

  it('成员 C: 整点预约、取消释放、固定码签到', async () => {
    const seat = await request(app.getHttpServer())
      .post('/api/v1/rooms/room_101/seats')
      .send({ code: 'A001', x: 1, y: 2 })
      .expect(201);

    const booking = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .send({
        userId: 'stu_01',
        seatId: seat.body.data.id,
        startAt: '2026-05-01T19:00:00.000+08:00',
        endAt: '2026-05-01T21:00:00.000+08:00',
      })
      .expect(201);
    expect(booking.body.data.status).toBe('PENDING_CHECKIN');

    const nonWholeHour = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .send({
        userId: 'stu_02',
        seatId: seat.body.data.id,
        startAt: '2026-05-01T19:30:00.000+08:00',
        endAt: '2026-05-01T20:30:00.000+08:00',
      })
      .expect(422);
    expect(nonWholeHour.body.code).toBe(ErrorCode.BOOKING_NOT_WHOLE_HOUR);

    const duplicateSlot = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .send({
        userId: 'stu_02',
        seatId: seat.body.data.id,
        startAt: '2026-05-01T20:00:00.000+08:00',
        endAt: '2026-05-01T22:00:00.000+08:00',
      })
      .expect(409);
    expect(duplicateSlot.body.code).toBe(ErrorCode.BOOKING_SLOT_TAKEN);

    await request(app.getHttpServer())
      .post(`/api/v1/bookings/${booking.body.data.id}/cancel`)
      .send({ userId: 'stu_01' })
      .expect(201);

    const secondBooking = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .send({
        userId: 'stu_02',
        seatId: seat.body.data.id,
        startAt: '2026-05-01T19:00:00.000+08:00',
        endAt: '2026-05-01T21:00:00.000+08:00',
      })
      .expect(201);

    const wrongCode = await request(app.getHttpServer())
      .post(`/api/v1/bookings/${secondBooking.body.data.id}/check-in`)
      .send({ userId: 'stu_02', code: '000000' })
      .expect(422);
    expect(wrongCode.body.code).toBe(ErrorCode.INVALID_CODE);

    const checkedIn = await request(app.getHttpServer())
      .post(`/api/v1/bookings/${secondBooking.body.data.id}/check-in`)
      .send({ userId: 'stu_02', code: '123456' })
      .expect(201);
    expect(checkedIn.body.data.status).toBe('CHECKED_IN');
  });
});
