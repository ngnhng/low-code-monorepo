import { UserController } from '@controllers/user.controller';
import { Module } from '@nestjs/common';
import { UserService } from '@services/user.service';
import { PrismaService } from '@shared/services/prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
