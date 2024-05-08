import { UserService } from '@modules/user/services/user.service';
import { Module } from '@nestjs/common';

import { ProjectController } from './controllers/project.controller';
import { ProjectService } from './services/project.service';
import { ViewService } from './services/view.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, UserService, ViewService],
  exports: [ProjectService, ViewService],
})
export class ProjectModule {}
