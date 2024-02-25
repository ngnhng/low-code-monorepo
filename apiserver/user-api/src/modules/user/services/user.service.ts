import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findByUsername(username: string): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async getUserById(id: number): Promise<User> {
    const result = await this.prisma.user.findUnique({ where: { id } });

    if (!result) {
      throw new Error('User not found');
    }

    return result;
  }

  async getUserByEmail(email: string): Promise<User> {
    const result = await this.prisma.user.findUnique({ where: { email } });

    if (!result) {
      throw new Error('User not found');
    }

    return result;
  }

  async upsertUserByEmail(data: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    // look up the user by email and update the user
    // if the user is not found, create a new user
    return this.prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }
}
