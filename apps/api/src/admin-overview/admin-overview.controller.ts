import { Controller, ForbiddenException, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ErrorCode } from '@ibooking/shared-types';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { AdminOverviewService } from './admin-overview.service';

const ADMIN_ROLE_CODES = new Set([
  'ROLE_FULL_ADMIN',
  'ROLE_ROOM_ADMIN',
  'ROLE_AUDIT',
  'ROLE_DEPARTMENT_ADMIN'
]);

@Controller()
@UseGuards(AuthGuard)
export class AdminOverviewController {
  constructor(private readonly service: AdminOverviewService) {}

  @Get('/api/v1/admin/overview')
  getOverview(@Req() request: AuthenticatedRequest) {
    assertAdminRole(request);
    return this.service.getSnapshot();
  }

  @Get('/api/v1/admin/bookings')
  listBookings(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('size') size?: string
  ) {
    assertAdminRole(request);
    return this.service.listBookings({
      page: Number(page),
      size: Number(size)
    });
  }

  @Get('/api/v1/admin/violations')
  listViolations(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('size') size?: string
  ) {
    assertAdminRole(request);
    return this.service.listViolations({
      page: Number(page),
      size: Number(size)
    });
  }
}

function assertAdminRole(request: AuthenticatedRequest): void {
  const hasAdminRole = (request.auth?.roles ?? []).some((role) => ADMIN_ROLE_CODES.has(role.code));
  if (!hasAdminRole) {
    throw new ForbiddenException({
      code: ErrorCode.RBAC_FORBIDDEN,
      message: '仅管理端账号可访问管理概览'
    });
  }
}
