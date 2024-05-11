import { Controller, Get, Res } from '@nestjs/common';
import { register } from 'prom-client';

import { Public } from '../../decorators/public-route.decorator';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsSerivce: MetricsService) {}

  @Get()
  @Public()
  getMetrics() {
    return register.metrics();
  }
}
