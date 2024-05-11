import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { UserService } from '@services/user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  logger = new Logger('UserController');

  constructor(private userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Post('upsert')
  async upsertUserByEmail(
    @Body() req: { email: string; first_name: string; last_name: string },
  ): Promise<User> {
    // look up the user by email and update the user
    // if the user is not found, create a new user
    return this.userService.upsertUserByEmail({
      email: req.email,
      firstName: req.first_name,
      lastName: req.last_name,
    });
  }
}
