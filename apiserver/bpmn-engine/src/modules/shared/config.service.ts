import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

type AppConfig = {
  port: number;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rabbitmq: {
    host: string;
    port: number;
  };
  logger: {
    level: string;
  };
  name: string;
  version: string;
  environment: string;
};

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

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

    if (!value) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }

  get app(): AppConfig {
    return {
      port: this.getNumber('APP_PORT'),
      jwt: {
        secret: this.getString('JWT_SECRET'),
        expiresIn: this.getString('JWT_EXPIRATION'),
      },
      rabbitmq: {
        host: this.getString('RABBITMQ_HOST'),
        port: this.getNumber('RABBITMQ_PORT'),
      },

      logger: {
        level: this.getString('LOG_LEVEL'),
      },

      name: this.getString('APP_NAME'),
      version: this.getString('APP_VERSION'),
      environment: this.getString('NODE_ENV'),
    };
  }
}
