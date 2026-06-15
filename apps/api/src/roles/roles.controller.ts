import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@ibooking/shared-types';
import { AuthGuard } from '../auth/auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CreateRoleDto, ListRolesQueryDto, UpdateRolePermissionsDto } from './roles.dto';
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

  @Post()
  @RequirePermissions('role.assign')
  createRole(@Body() body: CreateRoleDto): Promise<Role> {
    return this.rolesService.createRole(body);
  }

  @Patch(':id/permissions')
  @RequirePermissions('role.assign')
  updateRolePermissions(
    @Param('id') id: string,
    @Body() body: UpdateRolePermissionsDto
  ): Promise<Role> {
    return this.rolesService.updateRolePermissions(id, body);
  }
}
