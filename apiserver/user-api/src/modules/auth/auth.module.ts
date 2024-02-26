import { AuthenticationController } from '@controllers/authentication.controller';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationService } from '@services/authentication.service';
import { SharedModule } from '@shared/shared.module';
import { GoogleOAuthStrategy } from '@strategies/google-oauth.strategy';

import { OAuthController } from './controllers/oauth.controller';
import { CustomGoogleStrategy } from './strategies/google-oauth-custom.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PasetoStrategy } from './strategies/paseto.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    PassportModule,
    SharedModule,
  ],
  providers: [
    AuthenticationService,
    GoogleOAuthStrategy,
    CustomGoogleStrategy,
    JwtStrategy,
    PasetoStrategy,
  ],
  exports: [AuthenticationService],
})
export class AuthModule {}
