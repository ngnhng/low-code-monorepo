import { Global, Module } from '@nestjs/common';
import type { Provider } from '@nestjs/common';
import { ConfigService } from './config.service';

const providers: Provider[] = [ConfigService];

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export default class SharedModule {}
