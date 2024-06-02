import { CLIENT_BASE_URL } from "../helpers/common.helper";
import { APIService } from "./api.service";

export class IntegrationService extends APIService {
    constructor() {
        super(CLIENT_BASE_URL);
    }

    fetchSheets = async (pid: string) => {
        const res = await this.get(`/api/projects/${pid}/integrations/sheets`);
        return res;
    };
}
