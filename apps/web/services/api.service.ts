'use client';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getLocalStorage } from '../lib/local-storage';

interface HTTPHeaders {
  [key: string]: string;
}

export abstract class APIService {
  protected baseURL: string;
  protected headers: HTTPHeaders = {};

  constructor(_baseURL: string) {
    this.baseURL = _baseURL;
  }

  getAccessToken(): string {
    // TODO: constant this string
    return getLocalStorage('yalc_at') || ''; 
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.getAccessToken()}`,
    };
  }

  get<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return axios({
      method: 'get',
      url: this.createURL(this.baseURL, url),
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    });
  }

  post(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse> {
    return axios({
      method: 'post',
      url: this.createURL(this.baseURL, url),
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    });
  }

  put(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse> {
    return axios({
      method: 'put',
      url: this.createURL(this.baseURL, url),
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    });
  }

  patch(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse> {
    return axios({
      method: 'patch',
      url: this.createURL(this.baseURL, url),
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    });
  }

  delete(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse> {
    return axios({
      method: 'delete',
      url: this.createURL(this.baseURL, url),
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
    });
  }

  protected createURL(base: string, rest: string): string {
    const url = base + rest;
    return url.replace(`//+/g`, '/');
  }
}
