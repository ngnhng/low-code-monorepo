'use client';

import { action, makeObservable, observable, runInAction } from 'mobx';
import { AppConfigService } from 'services/app-config.service';
import { IAppConfig } from 'types/app';
import { RootStore } from './root';

export interface IAppConfigStore {
  envConfig: IAppConfig | undefined;

  fetchEnvConfig: () => Promise<IAppConfig>;
}

export class AppConfigStore implements IAppConfigStore {
  // observables
  envConfig: IAppConfig | undefined = undefined;

  // root store
  rootStore: RootStore;

  // service
  appConfigService: AppConfigService;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      //observables
      //use .ref annotation since immutability of envConfig is expected.
      //see: https://mobx.js.org/observable-state.html#available-annotations
      envConfig: observable.ref,
      //actions
      fetchEnvConfig: action,
    });

    this.appConfigService = new AppConfigService();
    this.rootStore = _rootStore;
  }

  fetchEnvConfig = async () => {
    try {
      const config = await this.appConfigService.getEnvConfig();
      // temporary action that is immediately invoked
      if (config) {
        runInAction(() => {
          this.envConfig = config;
        });
      } else {
        throw new Error('Config not found');
      }

      return config;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
