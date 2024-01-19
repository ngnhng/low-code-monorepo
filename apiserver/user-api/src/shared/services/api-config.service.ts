import type {
  AppConfig,
  AuthConfig,
  DatabaseConfig,
  JWT,
  OAuth,
  OAuthGoogle,
  PASETO,
} from '@interfaces/configuration.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';

@Injectable()
export class ApiConfigService {
  constructor(private readonly configService: ConfigService) {}

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' environment variable is not a boolean');
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replaceAll('\\n', '\n');
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }

  get app(): AppConfig {
    return {
      port: this.getNumber('PORT'),
      clientUrl: this.getString('CLIENT_URL'),
    };
  }

  get database(): DatabaseConfig {
    return {
      host: this.getString('DATABASE_HOST'),
      port: this.getNumber('DATABASE_PORT'),
      uri: this.getString('DATABASE_URI'),
    };
  }

  get oauth(): OAuth {
    return {
      clientUrl: this.getString('CLIENT_URL'),
      google: this.getOAuthGoogle(),
    };
  }

  get jwt(): JWT {
    return {
      secret: this.getString('JWT_SECRET'),
      expiresIn: this.getString('JWT_EXPIRES_IN'),
      accessTokenExpiresIn: this.getString('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      refreshTokenExpiresIn: this.getString('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    };
  }

  get paseto(): PASETO {
    const secret = this.getString('PASETO_SECRET');

    if (!this.is32BytesSymmetricKey(secret)) {
      throw new Error(
        'PASETO_SECRET environment variable must be a 32 bytes long base64 string',
      );
    }

    return {
      secret,
      expiresIn: this.getString('PASETO_EXPIRES_IN'),
      accessTokenExpiresIn: this.getString('PASETO_ACCESS_TOKEN_EXPIRES_IN'),
      refreshTokenExpiresIn: this.getString('PASETO_REFRESH_TOKEN_EXPIRES_IN'),
    };
  }

  get authConfig(): AuthConfig {
    return {
      strategy: this.getString('AUTH_STRATEGY'),
      jwt: this.jwt,
      paseto: this.paseto,
    };
  }

  private getOAuthGoogle(): OAuthGoogle {
    return {
      clientId: this.getString('GOOGLE_CLIENT_ID'),
      clientSecret: this.getString('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.getString('GOOGLE_REDIRECT_URI'),
    };
  }

  private is32BytesSymmetricKey(key: string): boolean {
    return this.isByteLengthEqual(key, 32);
  }

  private isByteLengthEqual(key: string, length: number): boolean {
    return Buffer.byteLength(key, 'utf-8') === length;
  }
}
