import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@ibooking/shared-types';
import { AuthGuard } from '../auth/auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { AssignUserRoleDto, CreateUserDto, ImportUsersDto, ListUsersQueryDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/v1/users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('user.read')
  listUsers(@Query() query: ListUsersQueryDto): Promise<User[]> {
    return this.usersService.listUsers(query);
  }

  @Post()
  @RequirePermissions('user.read')
  createUser(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.createUser(body);
  }

  @Post('import')
  @RequirePermissions('user.read')
  importUsers(@Body() body: ImportUsersDto): Promise<User[]> {
    return this.usersService.importUsers(body.users);
  }

  @Patch(':id/role')
  @RequirePermissions('role.assign')
  assignUserRole(@Param('id') id: string, @Body() body: AssignUserRoleDto): Promise<User> {
    return this.usersService.assignUserRole(id, body);
  }
}
