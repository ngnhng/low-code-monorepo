import type { AuthPayloadDto } from '@dtos/auth.dto';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthenticationService } from '@services/authentication.service';
import { ApiConfigService } from '@shared/services/api-config.service';
import type { VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly apiConfigService: ApiConfigService,
  ) {
    super({
      clientID: apiConfigService.oauth.google.clientId,
      clientSecret: apiConfigService.oauth.google.clientSecret,
      callbackURL: apiConfigService.oauth.google.redirectUri,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<AuthPayloadDto> {
    const user = await this.authService.validateUser({
      firstName: profile.name.familyName,
      lastName: profile.name.givenName,
      email: profile.emails[0].value,
    });

    return {
      id: user.id,
      email: user.email,

      accessToken,
      refreshToken,
    };
  }
}
