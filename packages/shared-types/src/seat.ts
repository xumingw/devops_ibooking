import { z } from 'zod';

export const SeatStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export const SeatResponseSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  code: z.string(),
  x: z.number().int(),
  y: z.number().int(),
  status: SeatStatusSchema,
});

export const CreateSeatRequestSchema = z.object({
  code: z.string().trim().min(1).max(64),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
});

export const UpdateSeatRequestSchema = CreateSeatRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'at least one field is required',
);

export const UpdateSeatStatusRequestSchema = z.object({
  status: SeatStatusSchema,
});

export type SeatStatus = z.infer<typeof SeatStatusSchema>;
export type SeatResponseDto = z.infer<typeof SeatResponseSchema>;
export type CreateSeatRequestDto = z.infer<typeof CreateSeatRequestSchema>;
export type UpdateSeatRequestDto = z.infer<typeof UpdateSeatRequestSchema>;
export type UpdateSeatStatusRequestDto = z.infer<typeof UpdateSeatStatusRequestSchema>;
