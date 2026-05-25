import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class StudentLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_-]{3,64}$/)
  studentId!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_-]{3,64}$/)
  username!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
