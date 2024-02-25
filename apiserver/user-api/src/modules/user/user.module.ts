import { UserController } from '@controllers/user.controller';
import { Module } from '@nestjs/common';
import { UserService } from '@services/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
