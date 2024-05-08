import { Injectable } from '@nestjs/common';
import type { Workflow } from '@prisma/client';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {} // private user: UserService,

  async getWorkflowsByEmail(userEmail: string): Promise<Workflow[]> {
    return this.prisma.workflow.findMany({
      where: {
        user: {
          email: userEmail.toString(),
        },
      },
    });
  }

  async getWorkflowByWid(wid: string): Promise<Workflow | null> {
    return this.prisma.workflow.findFirst({
      where: {
        wid: wid.toString(),
      },
    });
  }

  async createWorkflow(
    projectId: string,
    userEmail: string,
    payload: {
      wid: string;
      wfData: string;
      title: string;
    },
  ): Promise<Workflow> {
    return this.prisma.workflow.create({
      data: {
        wid: payload.wid,
        wfData: payload.wfData,
        title: payload.title,
        project: {
          connect: {
            pid: projectId.toString(),
          },
        },
        user: {
          connect: {
            email: userEmail.toString(),
          },
        },
      },
    });
  }

  async updateWorkflowByWid(wid: string, wfData: string) {
    return this.prisma.workflow.update({
      where: {
        wid: wid.toString(),
      },
      data: {
        wfData: wfData.toString(),
      },
    });
  }
}
