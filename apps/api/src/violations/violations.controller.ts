import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentViolationSummary } from '@ibooking/shared-types';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import { ViolationsService } from './violations.service';

@ApiTags('violations')
@Controller('api/v1/violations')
@UseGuards(AuthGuard)
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Get('me')
  getMyViolations(@Req() request: AuthenticatedRequest): Promise<StudentViolationSummary> {
    return this.violationsService.getStudentSummary(request.auth!.user.id);
  }
}
