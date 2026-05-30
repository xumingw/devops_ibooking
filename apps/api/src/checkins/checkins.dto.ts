import { IsString, Matches } from 'class-validator';

export class SubmitCheckInDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: '动态码必须是 6 位数字' })
  code!: string;
}
