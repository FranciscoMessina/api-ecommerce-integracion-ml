import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { MeliApiError, MeliOauthResponse } from '../types/meli.types.js';

@Injectable()
export class MeliOauth {
  private httpInstance: AxiosInstance = axios.create();

  constructor(private readonly config: ConfigService, private readonly emitter: EventEmitter2) {
    this.httpInstance.defaults.baseURL = this.config.get('MELI_API_URL');
  }

  async getAccessToken(code: string): Promise<AxiosResponse<MeliOauthResponse> | Promise<AxiosResponse<MeliApiError>>> {
    try {
      const response = await this.httpInstance.post<MeliOauthResponse>(
        `/oauth/token`,
        {
          grant_type: 'authorization_code',
          client_id: this.config.get('MELI_CLIENT_ID'),
          client_secret: this.config.get('MELI_CLIENT_SECRET'),
          code: code,
          redirect_uri: this.config.get('MELI_API_REDIRECT_URL'),
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response;
    } catch (error) {
      if (error.isAxiosError) {
        const err = error as AxiosError<MeliApiError>;
        return err.response;
      }

      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AxiosResponse<MeliOauthResponse | MeliApiError>> {
    try {
      const response = await this.httpInstance.post<MeliOauthResponse>(
        `/oauth/token`,
        {
          grant_type: 'refresh_token',
          client_id: this.config.get('MELI_CLIENT_ID'),
          client_secret: this.config.get('MELI_CLIENT_SECRET'),
          refresh_token: refreshToken,
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response;
    } catch (error) {
      // console.log({ refreshError: error, data: error.response.data });
      if (error.isAxiosError) {
        const err = error as AxiosError<MeliApiError>;

        return err.response;
      }

      throw error;
    }
  }
}
