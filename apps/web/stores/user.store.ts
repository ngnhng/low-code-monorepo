'use client';

import { action, makeObservable, observable, runInAction } from 'mobx';
import { AuthService } from 'services/auth.service';
import { UserService } from 'services/user.service';
import { IUser } from 'types/user';
import { RootStore } from './root';
import { setLocalStorage } from '../lib/local-storage';

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
    setLocalStorage(
      'yalc_at',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSIsImVtYWlsIjoidGVzdGVyQGdtYWlsLmNvbSIsInJvbGUiOiJ3ZWJ1c2VyIiwicHJvZmlsZV9pbWFnZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0p2djdEUGtQWkxNU2hld3NJNmFJc1dFcW82MzgwZmxESzlEeFFoV2REVDl3PXM5Ni1jIiwicmVnaXN0ZXJlZF9jbGFpbXMiOnsiaXNzIjoieWFsYy1hcGkiLCJleHAiOjE4MDg5NDYwMjcsImlhdCI6MTcwODkyNDQyN319.FbSwQZdj_i1FyMmP5FViB9X55vQk-xmisVdIe_4i7gs',
    );
    runInAction(() => {
      this.currentUser = {
        email: 'abc@gmail.com',
        display_name: 'John Doe',
        profile_image: 'https://via.placeholder.com/150',
      };

      this.isLoggedIn = true;
    });
  };

  // remove user from local storage and set user to undefined
  signOut = async (): Promise<void> => {
    try {
      await this.authService.signOut();
      runInAction(() => {
        this.currentUser = undefined;
        this.isLoggedIn = false;
        this.currentUserError = undefined;
      });
    } catch (error) {
      throw new Error('Error signing out:' + error);
    }
  };
}
