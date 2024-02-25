import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, CLIENT_BASE_URL } from 'helpers/common.helper';
import { APIService } from './api.service';

export abstract class RouteHandlerAPIService extends APIService {
  clientURL: string;

  constructor(customBaseURL?: string) {
    if (customBaseURL) {
      super(customBaseURL);
    } else {
      super(API_BASE_URL);
    }

    this.clientURL = CLIENT_BASE_URL;
  }

  // create GET request to route handler (api proxy), which will convert cookies to headers per requirement.
  getServerSide(url: string, config = {}): Promise<AxiosResponse> {
    return axios({
      method: 'get',
      url: this.createURL(this.clientURL, url),
      ...config,
    });
  }

  postServerSide(url: string, data = {}, config = {}): Promise<AxiosResponse> {
    return axios({
      method: 'post',
      url: this.createURL(this.clientURL, url),
      data,
      ...config,
    });
  }

  putServerSide(url: string, data = {}, config = {}): Promise<AxiosResponse> {
    return axios({
      method: 'put',
      url: this.createURL(this.clientURL, url),
      data,
      ...config,
    });
  }
}
