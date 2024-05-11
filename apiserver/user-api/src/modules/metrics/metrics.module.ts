import type {
  MiddlewareConsumer,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Module } from '@nestjs/common';

import { PrometheusMiddleware } from '../../middlewares/metrics';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule implements NestModule, OnApplicationBootstrap {
  constructor(private metrics: MetricsService) {}

  onApplicationBootstrap() {
    //this.metrics.enableDefaultMetrics();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrometheusMiddleware).forRoutes('*');
  }
}
