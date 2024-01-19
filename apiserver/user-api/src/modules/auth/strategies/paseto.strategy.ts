import type { AuthPayloadDto } from '@dtos/auth.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PasetoService } from '@shared/services/paseto.service';
import type { Request } from 'express';
import { Strategy } from 'passport-custom';

@Injectable()
export class PasetoStrategy extends PassportStrategy(Strategy, 'paseto') {
  constructor(private readonly pasetoService: PasetoService) {
    super();
  }

  async validate(req: Request): Promise<AuthPayloadDto> {
    const token = await this.pasetoFromRequest(req);

    return await this.verifyToken(token);
  }

  private async pasetoFromRequest(req: Request): Promise<string> {
    try {
      return this.extractTokenFromRequest(req);
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async verifyToken(token: string): Promise<AuthPayloadDto> {
    return await this.pasetoService.verifyTokenAsync(token);
  }

  private extractTokenFromRequest(req: Request): string {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    return authHeader.replace('Bearer ', '');
  }
}
