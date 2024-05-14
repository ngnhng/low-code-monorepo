import { Module } from '@nestjs/common';
import { WorkflowService } from './services/workflow.service';
import { WorkflowController } from './controllers/workflow.controller';

@Module({
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
