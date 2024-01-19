import { RedirectingException } from '@exceptions/redirecting.exception';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import type { Response } from 'express';

@Catch(RedirectingException)
export class RedirectingExceptionFilter implements ExceptionFilter {
  catch(exception: RedirectingException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.redirect(exception.url);
  }
}
