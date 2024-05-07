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
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Project } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { ProjectService } from '../services/project.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  logger = new Logger('ProjectController');

  constructor(private project: ProjectService) {}

  @Get()
  async getProjectsByEmail(
    @Param('userId') userId: string,
    @Req() req,
  ): Promise<Project[]> {
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

  @Delete(':projectId')
  async deleteProject(@Param('projectId') projectId: string) {
    return this.project.deleteProjectById(projectId.toString());
  }
}
