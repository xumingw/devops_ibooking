import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@ibooking/shared-types';
import { AuthGuard } from '../auth/auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ListRolesQueryDto } from './roles.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('api/v1/roles')
@UseGuards(AuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('role.assign')
  listRoles(@Query() query: ListRolesQueryDto): Promise<Role[]> {
    return this.rolesService.listRoles(query);
  }
}
