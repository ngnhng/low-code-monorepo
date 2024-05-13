/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

export const XML = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const { body } = ctx.switchToHttp().getRequest();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });

    if (parser.parse(body)) {
      return parser.parse(body);
    }

    return 'Invalid XML format';
  },
);
