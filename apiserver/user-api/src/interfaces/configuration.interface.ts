export interface Configuration {
  database: DatabaseConfig;
  app: AppConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  uri: string;
}

export interface OAuth {
  clientUrl: string;
  google: OAuthGoogle;
}

export interface OAuthGoogle {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface JWT {
  secret: string;
  expiresIn: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface PASETO {
  secret: string;
  expiresIn: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface AuthConfig {
  strategy: string;
  jwt: JWT;
  paseto: PASETO;
}

export interface AppConfig {
  port: number;
  clientUrl: string;
}
