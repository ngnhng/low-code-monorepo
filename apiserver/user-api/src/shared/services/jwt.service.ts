import type { ITokenService as TokenService } from '@interfaces/token-service.interface';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ApiConfigService } from './api-config.service';

@Injectable()
export class JwtTokenService extends JwtService implements TokenService {
  constructor(private readonly apiConfigService: ApiConfigService) {
    super();
  }

  async encryptAsync(payload: any): Promise<string> {
    return await this.signAsync(payload);
  }

  async decryptAsync(token: string): Promise<any> {
    return await this.verifyAsync(token);
  }

  async verifyTokenAsync(token: string): Promise<any> {
    return await this.verifyAsync(token);
  }

  async generateAccessTokenAsync(payload: any): Promise<string> {
    return await this.signAsync(payload, {
      secret: `${this.apiConfigService.jwt.secret}access`,
      expiresIn: this.apiConfigService.jwt.accessTokenExpiresIn,
    });
  }

  async generateRefreshTokenAsync(payload: any): Promise<string> {
    return await this.signAsync(payload, {
      secret: `${this.apiConfigService.jwt.secret}refresh`,
      expiresIn: this.apiConfigService.jwt.refreshTokenExpiresIn,
    });
  }
}
