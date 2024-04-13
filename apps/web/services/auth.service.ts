import { CLIENT_BASE_URL } from "../helpers/common.helper";
import { removeLocalStorage, setLocalStorage } from "../lib/local-storage";
import { APIService } from "./api.service";

export interface ILoginTokenResponse {
    access_token: string;
    refresh_token: string;
}

export class AuthService extends APIService {
    constructor() {
        super(CLIENT_BASE_URL);
    }

    get oauthUrl(): string {
        return this.createURL(this.baseURL, "/api/v1/oauth/google");
    }

    async signOut(): Promise<boolean> {
        //try {
        //  await this.postServerSide('/api/auth/sign-out');
        //  return true;
        //} catch (error) {
        //  console.log(error);
        //  throw error;
        //}
        removeLocalStorage("yalc_at");
        return true;
    }

    async socialAuth(data: any): Promise<ILoginTokenResponse> {
        return this.post("/api/auth/social", JSON.stringify(data), {
            headers: {},
        })
            .then((response) => {
                this.setAccessToken(response?.data?.access_token);
                this.setRefreshToken(response?.data?.refresh_token);
                return response?.data;
            })
            .catch((error) => {
                console.log(error);
                throw error?.response?.data;
            });
    }

    setAccessToken(token: string) {
        setLocalStorage("yalc_at", token);
    }

    setRefreshToken(token: string) {
        setLocalStorage("yalc_rt", token);
    }
}
