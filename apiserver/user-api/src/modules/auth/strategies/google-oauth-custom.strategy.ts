import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ApiConfigService } from '@shared/api-config.service';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { Strategy as OAuth2Strategy } from 'passport-custom';
import * as url from 'url';

import { RedirectingException } from '../../../exceptions/redirecting.exception';
@Injectable()
export class CustomGoogleStrategy extends PassportStrategy(
  OAuth2Strategy,
  'google-custom',
) {
  private logger = new Logger(CustomGoogleStrategy.name);

  constructor(private readonly apiConfigService: ApiConfigService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    // Here you can implement your custom Google OAuth2 logic.
    // You can access the request object via `req`.
    // If the user is not authenticated, throw an UnauthorizedException.

    const code = req.query.code as string;

    if (!code) {
      // redirect to google login
      const url = this.authorizationURL();
      this.logger.debug('redirect to google login: ', url);

      throw new RedirectingException(url);
    }

    const user = await this.authenticateWithGoogle(req);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async authenticateWithGoogle(req: Request): Promise<any> {
    // Implement your logic here to authenticate the user with Google.

    // Exchange the code for access token and ID token
    this.logger.debug('authenticateWithGoogle: ', JSON.stringify(req.query));
    const { code } = req.query;

    if (!code) {
      throw new UnauthorizedException();
    }

    const tokenResponse = await this.getToken(code.toString());

    const user = await this.getGoogleProfile(tokenResponse.access_token);

    if (!user) {
      throw new UnauthorizedException();
    }

    // TODO: check if user exists in database
    return user;
  }

  private async getGoogleProfile(accessToken: string): Promise<any> {
    const googleProfileUrl = url.format({
      protocol: 'https',
      host: 'www.googleapis.com',
      pathname: '/oauth2/v1/userinfo',
    });

    const res = await fetch(googleProfileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.json();
  }

  private async getToken(code: string): Promise<any> {
    const { clientId, clientSecret, redirectUri } =
      this.apiConfigService.oauth.google;

    const clientUrl = this.apiConfigService.app.clientUrl;

    const googleUrl = url.format({
      protocol: 'https',
      host: 'oauth2.googleapis.com',
      pathname: '/token',
      query: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${clientUrl}${redirectUri}`,
        grant_type: 'authorization_code',
      },
    });

    const res = await fetch(googleUrl, { method: 'POST' });
    //{
    //	"access_token": "1/fFAGRNJru1FTz70BzhT3Zg",
    //	"expires_in": 3920,
    //	"token_type": "Bearer",
    //	"scope": "https://www.googleapis.com/auth/drive.metadata.readonly",
    //	"refresh_token": "1//xEoDL4iW3cxlI7yDbSRFYNG01kVKM2C-259HOF2aQbI"
    //  }

    return res.json();
  }

  //  https://accounts.google.com/o/oauth2/v2/auth?
  // scope=https%3A//www.googleapis.com/auth/drive.metadata.readonly&
  // access_type=offline&
  // include_granted_scopes=true&
  // response_type=code&
  // state=state_parameter_passthrough_value&
  // redirect_uri=https%3A//oauth2.example.com/code&
  // client_id=client_id

  authorizationURL(): string {
    const { redirectUri } = this.apiConfigService.oauth.google;

    const clientUrl = this.apiConfigService.app.clientUrl;

    return url.format({
      protocol: 'https',
      host: 'accounts.google.com',
      pathname: '/o/oauth2/v2/auth',
      query: {
        scope: 'email profile',
        access_type: 'offline',
        include_granted_scopes: true,
        response_type: 'code',
        redirect_uri: `${clientUrl}${redirectUri}`,
        client_id: this.apiConfigService.oauth.google.clientId,
      },
    });
  }

  private generateState(): string {
    const encoding = 'hex';

    if (!Buffer.isEncoding(encoding)) {
      throw new UnauthorizedException('Bad server configuration');
    }

    return crypto.randomBytes(Number(24)).toString(encoding);
  }
}
