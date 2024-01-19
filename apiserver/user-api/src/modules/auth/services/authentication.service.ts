import { TOKEN_SERVICE } from '@constants/auth.constant';
import type { AuthPayloadDto, RefreshDto } from '@dtos/auth.dto';
import type { UserDTO } from '@dtos/user.dto';
import { ITokenService } from '@interfaces/token-service.interface';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { UserService } from '@services/user.service';
import { ApiConfigService } from '@shared/services/api-config.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly apiConfigService: ApiConfigService,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async findUserById(id: number) {
    return await this.userService.getUserById(id);
  }

  async validateUser(profile: UserDTO): Promise<User> {
    const user = await this.userService.getUserByEmail(profile.email);

    if (user) {
      return user;
    }

    return await this.userService.createUser(profile);
  }

  async login(user: AuthPayloadDto): Promise<[string, string]> {
    const payload = {
      ...user,
    };

    return [
      await this.tokenService.generateAccessTokenAsync(payload),
      await this.tokenService.generateRefreshTokenAsync(payload),
    ];
  }

  async refresh(refreshDto: RefreshDto) {
    try {
      const verifyToken = await this.tokenService.verifyTokenAsync(
        refreshDto.RefreshToken,
      );

      const user = await this.userService.getUserByEmail(verifyToken.email);

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const payload = {
        id: user.id,
        email: user.email,

        // at rt from google
        accessToken: verifyToken.accessToken,
        refreshToken: verifyToken.refreshToken,
      };

      const [newAt, newRt] = [
        await this.tokenService.generateAccessTokenAsync(payload),
        await this.tokenService.generateRefreshTokenAsync(payload),
      ];

      return [newAt, newRt];
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}
