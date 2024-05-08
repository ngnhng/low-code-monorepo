import { CreateWorkflowDto } from '@dtos/workflow.dto';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import {
  Body,
  Controller,
  // Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { type Workflow } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { WorkflowService } from '../services/workflow.service';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  logger = new Logger('WorkflowController');

  constructor(private workflow: WorkflowService) {}

  @Get()
  async getWorkflows(@Req() req): Promise<Workflow[]> {
    const email: string = req.user.email;

    return this.workflow.getWorkflowsByEmail(email);
  }

  @Post()
  async createWorkflow(
    @Req() req,
    @Body() createWorkflow: CreateWorkflowDto,
  ): Promise<Workflow> {
    const wid: string = uuidv4();
    const title: string = createWorkflow.title;
    const userEmail: string = req.user.email;
    const wfData: string = createWorkflow.wfData;
    const pid: string = createWorkflow.pid;

    return this.workflow.createWorkflow(pid, userEmail, {
      wid,
      wfData,
      title,
    });
  }

  @Get(':wid')
  async getWorkflowByWid(@Param('wid') wid: string, @Req() req) {
    const email: string = req.user.email;

    const isValid = await this.workflow.checkValidUser(wid, email);

    if (!isValid) {
      return new UnauthorizedException();
    }

    const workflow = await this.workflow.getWorkflowByWid(wid);

    if (!workflow) {
      throw new NotFoundException(`Workflow ${wid} not found`);
    }

    return workflow;
  }

  @Put(':wid')
  async updateWorkflowByWid(
    @Param('wid') wid: string,
    @Body('wfData') wfData: string,
    @Req() req,
  ) {
    const email: string = req.user.email;

    const isValid = await this.workflow.checkValidUser(wid, email);

    if (!isValid) {
      return new UnauthorizedException();
    }

    return this.workflow.updateWorkflowByWid(wid, wfData);
  }
}
