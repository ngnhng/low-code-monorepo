import { CLIENT_BASE_URL } from "../helpers/common.helper";
import { APIService } from "./api.service";

export class ProjectService extends APIService {
    constructor() {
        super(CLIENT_BASE_URL);
    }

    async getProject(pid: string) {
        const response = await this.get(`/api/projects/${pid}`);
        return response.data.data;
    }

    async getProjectList() {
        const response = await this.get("/api/projects");
        // reponse is an array of projects
        return response.data;
    }

    async saveView(pid: string, view: any, viewId: string) {
        try {
            await this.put(`/api/projects/${pid}/views/${viewId}`, view).then(
                (response) => {
                    return response.data;
                }
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async createProject(title: string, uuid: string, userEmail: string) {
        const response = await this.post("/api/projects", {
            title,
            uuid,
            userEmail,
        });
        return response.data;
    }

    async createView(route: string, title: string, pid: string) {
        const payload = {
            route,
            id: "198000000",
            content: [],
            root: {
                props: {
                    title,
                },
            },
        };

        const response = await this.post(`/api/projects/${pid}/views`, payload);
        return response.data;
    }
}
