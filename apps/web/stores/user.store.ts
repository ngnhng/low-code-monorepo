import { action, makeObservable, observable, runInAction } from 'mobx';
import { AuthService } from 'services/auth.service';
import { UserService } from 'services/user.service';
import { IUser } from 'types/user';
import { RootStore } from './root';
import { AppConfigService } from '../services/app-config.service';

export interface IUserStore {
  isLoggedIn: boolean | undefined;

  currentUser: IUser | undefined;
  currentUserError: any;

  fetchCurrentUser: () => Promise<IUser>;

  setDefaultUser: () => void;

  signOut: () => Promise<void>;
}

export class UserStore {
  //observables
  isLoggedIn: boolean | undefined = false;

  currentUser: IUser | undefined;

  currentUserError: any;

  // root store
  rootStore: RootStore;

  //service
  userService: UserService;
  authService: AuthService;
  appConfigService: AppConfigService;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      //observable
      isLoggedIn: observable.ref,
      currentUser: observable.ref,
      //action
      fetchCurrentUser: action,
      setDefaultUser: action,
      signOut: action,
      //computed
    });

    this.rootStore = _rootStore;
    this.userService = new UserService();
    this.authService = new AuthService();
    this.appConfigService = new AppConfigService();

    this.isLoggedIn = undefined;
    this.currentUser = undefined;
    this.currentUserError = undefined;
  }

  fetchCurrentUser = async () => {
    try {
      const response = await this.userService.currentUser();
      // TODO: better response visibility
      if (response) {
        runInAction(() => {
          this.currentUser = response;
          this.isLoggedIn = true;
        });
      } else {
        this.isLoggedIn = false;
      }

      return response;
    } catch (error) {
      runInAction(() => {
        this.currentUser = undefined;
        this.isLoggedIn = false;
        this.currentUserError = error;
      });

      throw error;
    }
  };

  setDefaultUser = (): void => {
    runInAction(() => {
      this.currentUser = {
        email: 'abc@gmail.com',
        display_name: 'John Doe',
      };

      this.isLoggedIn = true;
    });
  };

  signOut = async (): Promise<void> => {
    try {
      await this.authService.signOut();
      runInAction(() => {
        this.currentUser = undefined;
        this.isLoggedIn = false;
      });
    } catch (error) {
      throw new Error('Error signing out:' + error);
    }
  };
}
