import {
  CreateDataIntegrationDto,
  GetDataIntegrationDto,
} from '@dtos/data-integration.dto';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import {
  Body,
  Controller,
  // Delete,
  Get,
  Logger,
  // NotFoundException,
  // Param,
  Post,
  // Put,
  // Req,
  // UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { DataIntegrationService } from '../services/data-integration.service';

@Controller('data-integrations')
@UseGuards(JwtAuthGuard)
export class DataIntegrationController {
  logger = new Logger('DataIntegrationController');

  constructor(private integration: DataIntegrationService) {}

  @Get('all')
  async getDataIntegrationByProjectId(@Body() payload: GetDataIntegrationDto) {
    return this.integration.getConnectionDataByProjectId(payload.pid);
  }

  @Post()
  async addDataIntegration(@Body() payload: CreateDataIntegrationDto) {
    return this.integration.addConnection(
      payload.pid,
      payload.name,
      payload.connectionType,
      payload.connectionMetadata,
    );
  }
}
