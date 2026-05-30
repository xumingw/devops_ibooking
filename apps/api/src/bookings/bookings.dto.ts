import { IsISO8601, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStudentBookingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  seatId!: string;

  @IsISO8601()
  startAt!: string;

  @IsISO8601()
  endAt!: string;
}
