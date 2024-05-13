import { Module } from '@nestjs/common';

import { DataIntegrationController } from './controllers/data-integration.controller';
import { DataIntegrationService } from './services/data-integration.service';

@Module({
  controllers: [DataIntegrationController],
  providers: [DataIntegrationService],
  exports: [DataIntegrationService],
})
export class DataIntegrationModule {}
