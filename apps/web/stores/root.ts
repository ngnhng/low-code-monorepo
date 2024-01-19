import { IAppConfigStore } from "./app-config.store";
import { AppConfigStore } from "./app-config.store";
import { IUserStore, UserStore } from "./user.store";

//related documentation of mobx
//https://mobx.js.org/defining-data-stores.html#combining-multiple-stores/
export class RootStore {
  
  appConfig: IAppConfigStore;
  user: IUserStore;

  // pass the root store so that each stores can interact which each other 
  // somewhat relate to singleton pattern fyi
  constructor() {
    this.appConfig = new AppConfigStore(this);
    this.user = new UserStore(this);
  }
}
