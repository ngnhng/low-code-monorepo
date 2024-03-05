'use client';

import { IUser } from 'types/user';
import { APIService } from './api.service';
import { CLIENT_BASE_URL } from '../helpers/common.helper';
import { getLocalStorage } from '../lib/local-storage';

export class UserService extends APIService {
  constructor() {
    super(CLIENT_BASE_URL);
  }

  // we check the local storage for the user token
  // decode the token and return the user
  // throw error if token is expired or not found
  async currentUser(): Promise<IUser> {
    const token = getLocalStorage('yalc_at') || "";
    // decode the token and return the user
    if (token !== "") {
      const base64Url = token.split('.')[1] || ""; // Get the payload part of the JWT token
      const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/'); // Convert Base64Url to Base64
      const utf8Payload = decodeURIComponent(
        [...window.atob(base64)]
          .map(function (c) {
            // eslint-disable-next-line unicorn/prefer-code-point
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );
      const payload = JSON.parse(utf8Payload); // Decode the UTF-8 string and parse the JSON
	  const registeredClaims = payload.registered_claims;
	  // check if the token is expired
	  if (registeredClaims.exp * 1000 < Date.now()) {
		throw new Error('Token expired');
	  }

      return {
        email: payload.email,
        display_name: payload.first_name + ' ' + payload.last_name,
        profile_image: payload.profile_image,
      };
    }
    throw new Error('No user found');
  }
}
