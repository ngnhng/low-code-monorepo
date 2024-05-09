import { Injectable } from '@nestjs/common';
// import type { DataIntegration } from '@prisma/client';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class DataIntegrationService {
  constructor(private prisma: PrismaService) {} // private user: UserService,

  async addConnection(
    projectId: string,
    name: string,
    connectionType: string,
    metadata,
  ) {
    return this.prisma.dataIntegration.create({
      data: {
        name: name.toString(),
        datasourceType: connectionType,
        datasourceMetadata: metadata,
        project: {
          connect: {
            pid: projectId,
          },
        },
      },
    });
  }

  async getConnectionDataByProjectId(projectId: string) {
    return this.prisma.dataIntegration.findMany({
      where: {
        project: {
          pid: projectId.toString(),
        },
      },
    });
  }
}
