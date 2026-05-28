import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@ibooking/shared-types';
import { AuthGuard } from '../auth/auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ListUsersQueryDto } from './users.dto';
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
}
