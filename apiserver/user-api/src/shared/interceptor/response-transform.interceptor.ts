import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Response<T> {
  meta: Meta<T>;
  data: T;
}

export interface Meta<T> {
  status: number;
  message: string;
  errors?: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const status = request.res.statusCode;
    const message = request.res.statusMessage;
    const errors = request.res.statusMessage;

    return next.handle().pipe(
      map((data) => ({
        meta: {
          status,
          message,
          errors,
        },

        data,
      })),
      catchError((error) => new Observable<Response<T>>(error)),
    );
  }
}
