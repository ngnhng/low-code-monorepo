import { CreateProjectDTO } from '@dtos/project.dto';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Project } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { ProjectService } from '../services/project.service';
import { ViewService } from '../services/view.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  logger = new Logger('ProjectController');

  constructor(
    private project: ProjectService,
    private view: ViewService,
  ) {}

  @Get()
  async getProjectsByEmail(@Req() req): Promise<Project[]> {
    const email: string = req.user.email;

    return this.project.getProjectByEmail(email);
  }

  @Post()
  async createProject(@Body() createProject: CreateProjectDTO, @Req() req) {
    const uuid: string = uuidv4();
    const title: string = createProject.title;
    const userEmail: string = req.user.email;

    return this.project.createProject(title, uuid, userEmail);
  }

  @Get(':projectId')
  async getProjectByPid(@Param('projectId') projectId: string, @Req() req) {
    const email: string = req.user.email;

    const isValid = await this.project.checkValidUser(projectId, email);

    if (!isValid) {
      return new UnauthorizedException();
    }

    return this.project.getProjectByPid(projectId.toString());
  }

  @Delete(':projectId')
  async deleteProject(@Param('projectId') projectId: string, @Req() req) {
    const email: string = req.user.email;

    const isValid = await this.project.checkValidUser(projectId, email);

    if (!isValid) {
      return new UnauthorizedException();
    }

    return this.project.deleteProjectById(projectId.toString());
  }

  @Post('/:projectId/views')
  async createView(
    @Param('projectId') projectId: string,
    @Body() viewData,
    @Req() req,
  ) {
    const email: string = req.user.email;

    const isValid = await this.project.checkValidUser(projectId, email);

    if (!isValid) {
      return new UnauthorizedException();
    }

    return this.view.addViewByPid(projectId, viewData);
  }

  @Put('/:projectId/views/:viewId')
  async updateViewByPid(
    @Param('projectId') projectId: string,
    @Param('viewId') viewId: string,
    @Body('viewData') viewData,
    @Req() req,
  ) {
    const email: string = req.user.email;

    const isValid = await this.project.checkValidUser(projectId, email);

    if (!isValid) {
      return new UnauthorizedException();
    }

    return this.view.updateViewByPid(projectId, viewId, viewData);
  }
}
