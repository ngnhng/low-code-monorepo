import { RouteHandlerAPIService } from "./route-handler.service";

export class AuthService extends RouteHandlerAPIService {

  constructor() {
    super();
  }

  async signOut(): Promise<boolean> {
    try {
      await this.postServerSide('/api/auth/sign-out');
      return true;
    } catch (error) {
      throw error;
    }
  }
}
