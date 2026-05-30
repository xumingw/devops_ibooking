import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentCheckInResult, StudentCheckInSession } from '@ibooking/shared-types';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import { SubmitCheckInDto } from './checkins.dto';
import { CheckInsService } from './checkins.service';

@ApiTags('checkins')
@Controller('api/v1/checkins')
@UseGuards(AuthGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Get('me/current')
  getCurrentSession(@Req() request: AuthenticatedRequest): Promise<StudentCheckInSession | null> {
    return this.checkInsService.getCurrentSession(request.auth!.user.id);
  }

  @Post('me')
  submitCode(
    @Req() request: AuthenticatedRequest,
    @Body() body: SubmitCheckInDto,
  ): Promise<StudentCheckInResult> {
    return this.checkInsService.submitCode(request.auth!.user.id, body.code);
  }
}
