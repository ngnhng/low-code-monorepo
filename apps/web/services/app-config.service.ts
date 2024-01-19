"use client"

import { IAppConfig } from 'types/app';
import { APIService } from 'services/api.service';
import { CLIENT_BASE_URL } from 'helpers/common.helper';

export class AppConfigService extends APIService {

  constructor() {
    super(CLIENT_BASE_URL);
  }

  async getEnvConfig(): Promise<IAppConfig> {
    return this.get("/api/configs", {
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.data)
      .catch((error) => { throw error?.response?.data; });
  }

}
