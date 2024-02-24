import { setLocalStorage } from '../lib/local-storage';
import { RouteHandlerAPIService } from './route-handler.service';

export class AuthService extends RouteHandlerAPIService {
  constructor() {
    super('http://localhost/auth-api');
  }


  get oauthUrl(): string {
	return this.createURL(this.baseURL, '/api/v1/oauth/google');
  }

  async signOut(): Promise<boolean> {
    //try {
    //  await this.postServerSide('/api/auth/sign-out');
    //  return true;
    //} catch (error) {
    //  console.log(error);
    //  throw error;
    //}
	setLocalStorage('yalc_at', '');
	return true;
  }
}
