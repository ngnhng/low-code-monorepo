import type { ITokenService as TokenService } from '@interfaces/token-service.interface';
import { Injectable } from '@nestjs/common';
import { V3 } from 'paseto';

import { ApiConfigService } from './api-config.service';

@Injectable()
export class PasetoService implements TokenService {
  constructor(private readonly apiConfigService: ApiConfigService) {}

  async generateToken(
    payload: any,
    purpose: 'local' | 'public',
    type: 'access' | 'refresh',
  ): Promise<string> {
    if (purpose === 'local') {
      return await V3.encrypt(
        payload,
        this.toPrivateKey(this.apiConfigService.paseto.secret),
        {
          expiresIn:
            type === 'access'
              ? this.apiConfigService.paseto.accessTokenExpiresIn
              : this.apiConfigService.paseto.refreshTokenExpiresIn,
        },
      );
    }

    return await V3.sign(
      payload,
      this.toPrivateKey(this.apiConfigService.paseto.secret),
      {
        expiresIn:
          type === 'access'
            ? this.apiConfigService.paseto.accessTokenExpiresIn
            : this.apiConfigService.paseto.refreshTokenExpiresIn,
      },
    );
  }

  async encryptAsync(payload: any): Promise<string> {
    return await V3.encrypt(
      payload,
      this.toPrivateKey(this.apiConfigService.paseto.secret),
    );
  }

  async decryptAsync(token: string): Promise<any> {
    return await V3.decrypt(
      token,
      this.toPrivateKey(this.apiConfigService.paseto.secret),
    );
  }

  async signPayload(payload: any): Promise<string> {
    return await V3.sign(
      payload,
      this.toPrivateKey(this.apiConfigService.paseto.secret),
      {
        expiresIn: this.apiConfigService.paseto.accessTokenExpiresIn,
      },
    );
  }

  async verifyTokenAsync(token: string): Promise<any> {
    if (this.getTokenPurpose(token) === 'local') {
      return await V3.decrypt(
        token,
        this.toPrivateKey(this.apiConfigService.paseto.secret),
      );
    }

    return await V3.verify(
      token,
      this.toPrivateKey(this.apiConfigService.paseto.secret),
    );
  }

  async generateAccessTokenAsync(payload: any): Promise<string> {
    return await this.generateToken(payload, 'local', 'access');
  }

  async generateRefreshTokenAsync(payload: any): Promise<string> {
    return await this.generateToken(payload, 'local', 'refresh');
  }

  private toPrivateKey(secret: string): string {
    return secret;
  }

  private getTokenPurpose(token: string): 'local' | 'public' {
    return token.startsWith('v3.local.') ? 'local' : 'public';
  }
}
