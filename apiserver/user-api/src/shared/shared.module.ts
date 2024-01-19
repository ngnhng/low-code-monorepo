import type { Provider } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';

import { TOKEN_SERVICE } from '../constants/auth.constant';
import { TransformInterceptor } from './interceptor/response-transform.interceptor';
import { SerializerInterceptor } from './interceptor/serializer.interceptor';
import { ApiConfigService } from './services/api-config.service';
import { JwtTokenService } from './services/jwt.service';
import { PasetoService } from './services/paseto.service';
import { PrismaService } from './services/prisma.service';

const providers: Provider[] = [
  ApiConfigService,
  TransformInterceptor,
  SerializerInterceptor,
  PrismaService,
  JwtTokenService,
  PasetoService,
  {
    provide: TOKEN_SERVICE,
    useFactory: (apiConfigService: ApiConfigService) => {
      switch (apiConfigService.authConfig.strategy) {
        case 'jwt': {
          return new JwtTokenService(apiConfigService);
        }

        case 'paseto': {
          return new PasetoService(apiConfigService);
        }

        default: {
          throw new Error('Unknown strategy');
        }
      }
    },
    inject: [ApiConfigService],
  },
];

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class SharedModule {}
