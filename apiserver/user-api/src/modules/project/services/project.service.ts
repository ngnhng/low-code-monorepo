// import { UserService } from '@modules/user/services/user.service';
import { Injectable } from '@nestjs/common';
import type { Project } from '@prisma/client';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {} // private user: UserService,

  async checkValidUser(projectId: string, userEmail: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: userEmail.toString(),
      },
      include: {
        projects: true,
      },
    });

    if (!user) {
      return false;
    }

    return user.projects.some((project) => project.pid === projectId);
  }

  async createProject(
    title: string,
    uuid: string,
    userEmail: string,
  ): Promise<Project> {
    return this.prisma.project.create({
      data: {
        title: title.toString(),
        pid: uuid,
        user: {
          connect: {
            email: userEmail.toString(),
          },
        },
      },
    });
  }

  async getProjectByEmail(email: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        user: {
          email: email.toString(),
        },
      },
      include: {
        views: true,
      },
    });
  }

  async getProjectsByUserId(userId: string) {
    return this.prisma.project.findMany({
      where: {
        user: {
          id: Number.parseInt(userId, 10),
        },
      },
      include: {
        views: true,
      },
    });
  }

  async getProjectByPid(pid: string): Promise<Project | null> {
    return this.prisma.project.findFirst({
      where: {
        pid: pid.toString(),
      },
      include: {
        views: true,
      },
    });
  }

  async deleteProjectById(pid: string) {
    return this.prisma.project.delete({
      where: {
        pid: pid.toString(),
      },
    });
  }
}
