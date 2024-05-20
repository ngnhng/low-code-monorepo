// import { UserService } from '@modules/user/services/user.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class ViewService {
  private logger = new Logger('ViewService');

  constructor(private prisma: PrismaService) {} // private user: UserService,

  async addViewByPid(projectId: string, viewData: Prisma.JsonObject) {
    this.logger.log('Adding view data', projectId, viewData);

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

  async updateViewByPid(
    projectId: string,
    viewId: string,
    viewData: Prisma.JsonObject,
  ) {
    const updatedView = await this.prisma.view.findFirst({
      where: {
        id: Number.parseInt(viewId, 10),
        //projectId: Number.parseInt(projectId, 10),
        project: {
          pid: projectId,
        },
      },
    });

    if (!updatedView) {
      throw new NotFoundException('View not found');
    }

    this.logger.log('Updating view data', updatedView);

    this.logger.log('View data', viewData);

    return this.prisma.view.update({
      where: {
        id: updatedView.id,
      },
      data: {
        uiData: viewData,
      },
    });
  }
}
