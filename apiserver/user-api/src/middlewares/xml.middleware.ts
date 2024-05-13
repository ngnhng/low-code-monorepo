/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NestMiddleware } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';

const bodyParserXML = bodyParser.text({
  type: 'application/xml',
});

@Injectable()
export class XMLMiddleware implements NestMiddleware {
  private logger = new Logger('XMLMiddleware');

  use(req: any, res: any, next: () => void) {
    this.logger.log('Request...');
    bodyParserXML(req, res, next);
  }
}
