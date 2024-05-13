import { AuthModule } from '@modules/auth/auth.module';
import { AuthenticationController } from '@modules/auth/controllers/authentication.controller';
import { OAuthController } from '@modules/auth/controllers/oauth.controller';
import { DataIntegrationController } from '@modules/data-integration/controllers/data-integration.controller';
import { DataIntegrationModule } from '@modules/data-integration/data-integration.module';
import { ProjectController } from '@modules/project/controllers/project.controller';
import { ProjectModule } from '@modules/project/project.module';
import { UserController } from '@modules/user/controllers/user.controller';
import { UserModule } from '@modules/user/user.module';
import { WorkflowController } from '@modules/workflow/controllers/workflow.controller';
import { WorkflowModule } from '@modules/workflow/workflow.module';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  Reflector,
} from '@nestjs/core';
import { SharedModule } from '@shared/shared.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './filters/all.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasetoAuthGuard } from './guards/paseto-auth.guard';
import { PrometheusMiddleware } from './middlewares/metrics';
import { MetricsModule } from './modules/metrics/metrics.module';
import { LoggingInterceptor } from './shared/interceptor/logging.interceptor';
import { SerializerInterceptor } from './shared/interceptor/serializer.interceptor';
import { ApiConfigService } from './shared/services/api-config.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ...(process.env.YALC_ENV_FILE
        ? { envFilePath: process.env.YALC_ENV_FILE }
        : {}),
    }),
    //PrometheusModule.register({
    //  path: '/metrics',
    //}),
    SharedModule,
    UserModule,
    AuthModule,
    ProjectModule,
    WorkflowModule,
    DataIntegrationModule,
    MetricsModule,
  ],
  controllers: [
    AppController,
    UserController,
    ProjectController,
    WorkflowController,
    DataIntegrationController,
    //AuthenticationController,
    //OAuthController,
    AuthenticationController,
    OAuthController,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useFactory: (
        apiConfigService: ApiConfigService,
        reflector: Reflector,
      ) => {
        switch (apiConfigService.authConfig.strategy) {
          case 'jwt': {
            return new JwtAuthGuard(reflector);
          }
          case 'paseto': {
            return new PasetoAuthGuard(reflector);
          }
          default: {
            throw new Error('Unknown strategy');
          }
        }
      },
      inject: [ApiConfigService, Reflector],
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrometheusMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
