import { z } from 'zod';

export const MinimalBookingStatusSchema = z.enum([
  'PENDING_CHECKIN',
  'CHECKED_IN',
  'CANCELLED_BY_USER',
]);

export const CreateBookingRequestSchema = z.object({
  userId: z.string().trim().min(1),
  seatId: z.string().trim().min(1),
  startAt: z.string().datetime({ offset: true }),
  endAt: z.string().datetime({ offset: true }),
});

export const CancelBookingRequestSchema = z.object({
  userId: z.string().trim().min(1),
});

export const CheckInBookingRequestSchema = z.object({
  userId: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export const BookingResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  roomId: z.string(),
  seatId: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  status: MinimalBookingStatusSchema,
});

export type MinimalBookingStatus = z.infer<typeof MinimalBookingStatusSchema>;
export type CreateBookingRequestDto = z.infer<typeof CreateBookingRequestSchema>;
export type CancelBookingRequestDto = z.infer<typeof CancelBookingRequestSchema>;
export type CheckInBookingRequestDto = z.infer<typeof CheckInBookingRequestSchema>;
export type BookingResponseDto = z.infer<typeof BookingResponseSchema>;
