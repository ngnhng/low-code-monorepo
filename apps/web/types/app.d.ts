interface IApiPaths {
  login: string;
}

interface IGoogleOAuthConfig {
  client_id: string;
  callback: string | null;
}

export interface IAppMode {
  is_dev: boolean;
  is_prod: boolean;

  no_auth: boolean;
}

export interface IAppConfig {
  mode: IAppMode;
  
  base_api_url: string | null;

  paths: IApiPaths;
  
  google_oauth: IGoogleOAuthConfig;
}
