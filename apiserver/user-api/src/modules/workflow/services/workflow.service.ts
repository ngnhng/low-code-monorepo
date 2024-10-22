import { Injectable, Logger } from '@nestjs/common';
import type { Workflow } from '@prisma/client';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class WorkflowService {
  private logger = new Logger('WorkflowService');

  constructor(private prisma: PrismaService) {} // private user: UserService,

  async checkValidUser(wid: string, userEmail: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: userEmail.toString(),
      },
      include: {
        workflows: true,
      },
    });

    if (!user) {
      return false;
    }

    return user.workflows.some((wf) => wf.wid === wid);
  }

  async getWorkflowsByEmail(pid, userEmail: string): Promise<Workflow[]> {
    return this.prisma.workflow.findMany({
      where: {
        user: {
          email: userEmail.toString(),
          projects: {
            some: {
              pid: pid.toString(),
            },
          },
        },
      },
    });
  }

  async getWorkflowByWid(wid: string): Promise<Workflow> {
    this.logger.log(`Getting workflow ${wid}`);

    return this.prisma.workflow
      .findFirst({
        where: {
          wid: wid.toString(),
        },
      })
      .then((wf) => {
        if (!wf) {
          throw new Error('Workflow not found');
        }

        return wf;
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
        wfData,
      },
    });
  }
}
