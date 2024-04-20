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

    if (isNil(value) || !value) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }

  get app(): AppConfig {
    return {
      port: this.getNumber('YALC_APP_SERVICE_HTTP_PORT'),
      clientUrl: this.getString('YALC_APP_FRONTEND_BASE_URL'),
    };
  }

  get database(): DatabaseConfig {
    return {
      user: this.getString('YALC_DATABASE_POSTGRES_USER'),
      password: this.getString('YALC_DATABASE_POSTGRES_PASSWORD'),
      host: this.getString('YALC_DATABASE_POSTGRES_HOST'),
      port: this.getNumber('YALC_DATABASE_POSTGRES_PORT'),
      dbName: this.getString('YALC_DATABASE_POSTGRES_USER_DB'),
      uri: `postgres://${this.getString(
        'YALC_DATABASE_POSTGRES_USER',
      )}:${this.getString('YALC_DATABASE_POSTGRES_PASSWORD')}@${this.getString(
        'YALC_DATABASE_POSTGRES_HOST',
      )}:${this.getNumber('YALC_DATABASE_POSTGRES_PORT')}/${this.getString(
        'YALC_DATABASE_POSTGRES_USER_DB',
      )}`,
    };
  }

  get oauth(): OAuth {
    return {
      clientUrl: this.getString('YALC_APP_FRONTEND_BASE_URL'),
      google: this.getOAuthGoogle(),
    };
  }

  get jwt(): JWT {
    return {
      secret: this.getString('YALC_AUTH_JWT_SECRET_AT_KEY'),
      expiresIn: this.getString('YALC_AUTH_JWT_SECRET_AT_EXPIRATION'),
      accessTokenExpiresIn: this.getString(
        'YALC_AUTH_JWT_SECRET_AT_EXPIRATION',
      ),
      refreshTokenExpiresIn: this.getString(
        'YALC_AUTH_JWT_SECRET_RT_EXPIRATION',
      ),
    };
  }

  //  get paseto(): PASETO {
  //    const secret = this.getString('PASETO_SECRET');

  //    if (!this.is32BytesSymmetricKey(secret)) {
  //      throw new Error(
  //        'PASETO_SECRET environment variable must be a 32 bytes long base64 string',
  //      );
  //    }

  //    return {
  //      secret,
  //      expiresIn: this.getString('PASETO_EXPIRES_IN'),
  //      accessTokenExpiresIn: this.getString('PASETO_ACCESS_TOKEN_EXPIRES_IN'),
  //      refreshTokenExpiresIn: this.getString('PASETO_REFRESH_TOKEN_EXPIRES_IN'),
  //    };
  //  }

  get authConfig(): AuthConfig {
    return {
      strategy: this.getString('YALC_AUTH_STRATEGY'),
      jwt: this.jwt,
      //  paseto: this.paseto,
    };
  }

  private getOAuthGoogle(): OAuthGoogle {
    return {
      clientId: this.getString('YALC_OAUTH_GOOGLE_CLIENT_ID'),
      clientSecret: this.getString('YALC_OAUTH_GOOGLE_CLIENT_SECRET'),
      redirectUri: this.getString('YALC_OAUTH_GOOGLE_REDIRECT_URI'),
    };
  }

  private is32BytesSymmetricKey(key: string): boolean {
    return this.isByteLengthEqual(key, 32);
  }

  private isByteLengthEqual(key: string, length: number): boolean {
    return Buffer.byteLength(key, 'utf-8') === length;
  }
}
