import { UserService } from '@modules/user/services/user.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ApiConfigService } from '@shared/services/api-config.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger('JwtStrategy');

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private user: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: apiConfigService.jwt.secret,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload) {
    // try {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    //   await this.user.getUserByEmail(payload.email);
    // } catch (error) {
    //   this.logger.error('Unauthorized', error);

    //   throw new UnauthorizedException(error);
    // }

    return { email: payload.email };
  }
}
