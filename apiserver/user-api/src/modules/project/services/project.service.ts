// import { UserService } from '@modules/user/services/user.service';
import { Injectable } from '@nestjs/common';
import type { Project } from '@prisma/client';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {} // private user: UserService,

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
        user: true,
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
        user: true,
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
