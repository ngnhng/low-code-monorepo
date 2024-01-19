import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

interface ILogMessageParams {
  correlationKey: string;
  method: string;
  url: string;
  userId: string;
  userAgent: string;
  ip: string;
  className: string;
  handlerName: string;
  statusCode?: number;
  contentLength?: string;
  duration?: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'http') {
      return this.logHttpCall(context, next);
    }

    return next.handle();
  }

  /**
   * Log HTTP Call Request and Response with tracking uuid (Interceptor)
   * @param context - ExecutionContext
   * @param next - CallHandler
   * @returns Observable
   */
  private logHttpCall(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { userAgent, ip, method, url, userId } = this.getRequestData(request);
    const correlationKey = uuidv4();
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    this.logger.log(
      this.createLogMessage({
        correlationKey,
        method,
        url,
        userId,
        userAgent,
        ip,
        className,
        handlerName,
      }),
    );

    const now = Date.now();

    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode, contentLength } = this.getResponseData(response);
        this.logger.log(
          this.createLogMessage({
            correlationKey,
            method,
            url,
            userId,
            userAgent,
            ip,
            className,
            handlerName,
            statusCode,
            contentLength,
            duration: Date.now() - now,
          }),
        );

        return data;
      }),
    );
  }

  private createLogMessage(params: ILogMessageParams): string {
    let message = `

		[${params.correlationKey}]
	>>  ${params.method} ${params.url} ${params.userId} 
	    ${params.userAgent} ${params.ip}: 
		${params.className} ${params.handlerName}
		
		`;

    if (params.statusCode) {
      message += ` ${params.statusCode} ${params.contentLength}: ${params.duration}ms`;
    }

    return message;
  }

  private getRequestData(request): {
    userAgent: string;
    ip: string;
    method: string;
    url: string;
    userId: string;
  } {
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;
    const { user } = request;
    const userId = user?.userId;

    return { userAgent, ip, method, url, userId };
  }

  private getResponseData(response): {
    statusCode: number;
    contentLength: string;
  } {
    const { statusCode } = response;
    const contentLength = response.get('content-length');

    return { statusCode, contentLength };
  }
}
