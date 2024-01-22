import { CLIENT_BASE_URL } from 'helpers/common.helper';
import { IUser } from 'types/user';
import { APIService } from './api.service';

export class UserService extends APIService {
  constructor() {
    super(CLIENT_BASE_URL);
  }

  async currentUser(): Promise<IUser> {
    return this.get('/api/users')
      .then((response) => response?.data)
      .catch((error) => {
        throw error;
      });
  }
}
