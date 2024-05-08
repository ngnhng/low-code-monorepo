// import { UserService } from '@modules/user/services/user.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {} // private user: UserService,

  async addViewByPid(projectId: string, viewData) {
    return this.prisma.view.create({
      data: {
        uiData: viewData,
        project: {
          connect: {
            pid: projectId,
          },
        },
      },
    });
  }

  async updateViewByPid(projectId: string, viewId: string, viewData) {
    const updatedView = await this.prisma.view.findFirst({
      where: {
        id: Number.parseInt(viewId, 10),
      },
    });

    return this.prisma.view.update({
      where: {
        id: updatedView?.id,
        project: {
          pid: projectId,
          id: 1,
        },
      },
      data: {
        uiData: viewData,
      },
    });
  }
}
