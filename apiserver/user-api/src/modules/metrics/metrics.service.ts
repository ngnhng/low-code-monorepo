import { Injectable } from '@nestjs/common';
import type { CounterConfiguration, GaugeConfiguration } from 'prom-client';
import client, { Counter, Gauge, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private requestCounter: Counter;

  private responseTimeHistogram: Histogram;

  enableDefaultMetrics() {
    client.collectDefaultMetrics({
      register,
    });
  }

  createCounter<T extends string>(opts: CounterConfiguration<T>) {
    return new Counter(opts);
  }

  createGauge<T extends string>(opts: GaugeConfiguration<T>) {
    return new Gauge(opts);
  }

  createHistogram(opts: client.HistogramConfiguration<string>) {
    return new Histogram(opts);
  }

  incrementRequestCounter(): void {
    this.requestCounter.inc();
  }

  observeResponseTime(
    method: string,
    path: string,
    status: string,
    responseTime: number,
  ): void {
    this.responseTimeHistogram
      .labels(method, path, status)
      .observe(responseTime);
  }

  async metrics() {
    return register.metrics();
  }
}
