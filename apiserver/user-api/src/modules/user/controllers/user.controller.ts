import { Controller, Get, Param } from '@nestjs/common';
import type { User } from '@prisma/client';
import { UserService } from '@services/user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }
}
