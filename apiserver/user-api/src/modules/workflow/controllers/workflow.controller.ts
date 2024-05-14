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
  Query,
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

  @Get(':pid')
  async getWorkflows(
    @Param('pid') pid: string,
    @Query('workflowId') workflowId: string,
    @Req() req,
  ): Promise<Workflow[]> {
    const email: string = req.user.email;

    this.logger.log(`Getting workflows for project ${pid} by ${email}`);

    if (workflowId) {
      await this.workflow
        .getWorkflowByWid(workflowId)
        .then((wf) => [wf])
        .catch((error) => {
          this.logger.error(`Error getting workflow ${workflowId}`, error);

          throw new NotFoundException(`Workflow ${workflowId} not found`);
        });
    }

    return this.workflow.getWorkflowsByEmail(pid, email);
  }

  @Post(':pid')
  async createWorkflow(
    @Req() req,
    @Param('pid') pid: string,
    @Query('title') title: string,
    //@Body() createWorkflow: CreateWorkflowDto,
    @Body() wfData: string,
  ): Promise<Workflow> {
    const wid: string = uuidv4();
    const userEmail: string = req.user.email;

    this.logger.log(
      `Creating workflow ${title} for project ${pid} by ${userEmail}`,
    );
    this.logger.log(`Workflow data: ${wfData}`);

    return this.workflow.createWorkflow(pid, userEmail, {
      wid,
      wfData,
      title,
    });
  }

  @Get(':id')
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
    @Body() wfData: string,
    @Req() req,
  ) {
    const email: string = req.user.email;

    const isValid = await this.workflow.checkValidUser(wid, email);

    if (!isValid) {
      return new UnauthorizedException();
    }

    if (!wfData) {
      throw new NotFoundException('Workflow data not provided');
    }

    return this.workflow.updateWorkflowByWid(wid, wfData);
  }
}
