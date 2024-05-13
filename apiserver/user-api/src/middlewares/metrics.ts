import type { NestMiddleware } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Histogram } from 'prom-client';

import { MetricsService } from '../modules/metrics/metrics.service';

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  httpRequests: Histogram<string>;

  private logger = new Logger('PromettheusMiddleware');

  constructor(private prometheus: MetricsService) {
    this.logger.log("Called!");
    this.httpRequests = this.prometheus.createHistogram({
      help: 'Tracks HTTP requests',
      name: 'http_requests',
      labelNames: ['method', 'path', 'statusCode'],
      buckets: [0.1, 0.5, 1, 1.5, 2, 3, 5],
    });
  }

  use(req: Request, res: Response, next: () => void) {
    const start = Date.now();
    res.once('finish', () => {
      const { method, route } = req;
      const { statusCode } = res;
      const duration = (Date.now() - start) / 1000;
      this.httpRequests.observe(
        {
          method,
          // utilizes route path instead of req.path to make sure is static (ie not affected by param values), the goal is to minimize cardinality
          path: route?.path || 'unmatched',
          statusCode,
        },
        duration,
      );
    });
    next();
  }
}
