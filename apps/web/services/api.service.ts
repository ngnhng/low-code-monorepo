import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

interface HTTPHeaders {
  [key: string]: string;
}

export abstract class APIService {
  protected baseURL: string;
  protected headers: HTTPHeaders = {};

  constructor(_baseURL: string) {
    this.baseURL = _baseURL;
  }

  getAccessToken() {
    // TODO: constant this string
    return Cookies.get("low-code_access-token");
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.getAccessToken()}`,
    };
  }

  get(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return axios({
      method: 'get',
      url: this.createURL(this.baseURL, url),
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    })
  }

  post(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return axios({
      method: 'post',
      url: this.createURL(this.baseURL, url),
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    })
  }

  put(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return axios({
      method: 'put',
      url: this.createURL(this.baseURL, url),
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    })
  }

  patch(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return axios({
      method: 'patch',
      url: this.createURL(this.baseURL, url),
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    })
  }

  delete(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return axios({
      method: 'delete',
      url: this.createURL(this.baseURL, url),
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    })
  }

  protected createURL(base: string, rest: string): string {
    const url = base + rest;
    return url.replace('/\/+/g', '/');
  }
}

