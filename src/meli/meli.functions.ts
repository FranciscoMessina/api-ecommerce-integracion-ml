import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { URLSearchParams } from 'url';
import { ErrorActions } from '../types/actions.types';
import { Attribute, CategoryAttributesResponse, GetItemsByIdsResponse, ItemAttributes, MeliItem, MeliItemSearchResponse } from '../types/items.types.js';
import { CategoriesResponse, CategoryDetails, MeliApiError, MeliSendMessageOptions } from '../types/meli.types';
import { MeliOrder, OrdersSearchResponse } from '../types/orders.types.js';
import { GetQuestionsFilters, QuestionsResponseTime } from '../types/questions.types.js';
import { MeliOauth } from './meli.oauth.js';

@Injectable()
export class MeliFunctions {
   private token: string;

   public sellerId: number;

   private refreshToken: string;

   private httpInstance = axios.create();

   constructor(private readonly config: ConfigService, private readonly emitter: EventEmitter2, private readonly meliOauth: MeliOauth) {
      this.httpInstance.defaults.baseURL = this.config.get('MELI_API_URL');

      this.httpInstance.interceptors.request.use((config) => {
         if (config.headers['Authorization'] !== this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
         }
         return config;
      });

      this.httpInstance.interceptors.response.use(
         (res) => res,
         async (error) => {
            const prevRequest = error?.config;

            const errorCodes = [401];

            if (errorCodes.includes(error?.response?.status) && !prevRequest?.sent) {
               prevRequest.sent = true;
               console.log('refreshing after request error');

               const refreshResponse = await this.meliOauth.refreshAccessToken(this.refreshToken);

               if ('error' in refreshResponse.data) {
                  throw new UnauthorizedException({
                     message: 'Please link meli again',
                     action: ErrorActions.LinkMeli,
                  });
               }

               this.token = refreshResponse.data.access_token;
               this.refreshToken = refreshResponse.data.refresh_token;
               prevRequest.headers['Authorization'] = `Bearer ${this.token}`;

               await this.emitter.emitAsync('meli.tokens.update', refreshResponse.data);

               return this.httpInstance(prevRequest);
            }

            return Promise.reject(error);
         },
      );
   }

   private request = {
      get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | AxiosResponse<MeliApiError>> => {
         try {
            const response = await this.httpInstance.get(url, config);

            return response;
         } catch (err) {
            console.log(err);

            if (err.isAxiosError) {
               return err.response
            }
            throw err
         }
      },
      post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | AxiosResponse<MeliApiError>> => {
         try {
            const response = await this.httpInstance.post(url, data, config);

            return response;
         } catch (err) {
            console.log(err);

            if (err.isAxiosError) {
               return err.response
            }
            throw err
         }
      },
      patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | AxiosResponse<MeliApiError>> => {
         try {
            const response = await this.httpInstance.patch(url, data, config);

            return response;
         } catch (err) {
            console.log(err);

            if (err.isAxiosError) {
               return err.response
            }
            throw err
         }
      },
      put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | AxiosResponse<MeliApiError>> => {
         try {
            const response = await this.httpInstance.put(url, data, config);

            return response;
         } catch (err) {
            console.log(err);

            if (err.isAxiosError) {
               return err
            }
            throw err
         }
      },

      delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | AxiosResponse<MeliApiError>> => {
         try {
            const response = await this.httpInstance.delete(url, config);

            return response;
         } catch (err) {
            console.log(err);

            if (err.isAxiosError) {
               return err
            }
            throw err
         }
      }

   }


   configure(config: { token: string; refresh: string; meliId: number }) {
      this.token = config.token;
      this.refreshToken = config.refresh;
      this.sellerId = config.meliId;
   }

   resetConfig() {
      this.token = undefined;
      this.refreshToken = undefined;
      this.sellerId = undefined;
   }

   async getQuestionsResponseTime(): Promise<AxiosResponse<QuestionsResponseTime | MeliApiError>> {

      const response = await this.request.get<QuestionsResponseTime>(`${this.sellerId}/questions/response_time`);

      return response;

   }

   /**
    * Get seller questions, if no filters passed, defaults to first 25 unanswered questions
    * @param {GetQuestionsFilters} filters
    * Only pass one of the filters, the only acceptable combination is From and Item, the rest must be individual
    */
   async getQuestions(filters?: GetQuestionsFilters): Promise<AxiosResponse<any | MeliApiError>> {
      const params = new URLSearchParams();

      let url = `/questions/search`;

      if (filters?.from && filters.item) {
         params.append('from', filters.from.toString());
         params.append('item', filters.item);

         url = `/questions/search`;
      } else {
         params.append('seller_id', this.sellerId.toString());
      }

      if (filters?.status) {
         params.append('status', filters.status);
      } else {
         params.append('status', 'UNANSWERED');
      }

      if (filters?.sort) {
         params.append('sort_types', filters.sort.order);
         params.append('sort_fields', filters.sort.fields);
      }

      params.append('limit', filters?.limit?.toString() || '25');
      params.append('offset', filters?.offset?.toString() || '0');

      if (filters?.questionId) {
         url = `/questions/${filters.questionId}`;
         params.delete('*');
      }

      params.append('api_version', '4');

      // try {
      const response = await this.request.get(url, { params });

      return response;

   }

   async answerQuestion({ id, answer }: { id: number; answer: string }) {
      // try {
      const response = await this.request.post(`/answers`, {
         question_id: id,
         text: answer,
      });

      return response;

   }

   async deleteQuestion(questionId: number) {
      // try {
      const response = await this.request.delete(`/questions/${questionId}`);

      return response;
   }

   async searchForItems(searchQuery: string, limit?: number) {
      // try {
      const response = await this.request.get<MeliItemSearchResponse>(`/users/${this.sellerId}/items/search?q=${searchQuery}&status=active&limit=${limit || 50}`);

      return response;

   }

   async createItem(itemInfo: any) {
      // try {
      const response = await this.request.post('/items', itemInfo);

      return response;

   }

   async addDescription(itemId: string, description: string) {
      // try {
      const response = await this.request.post(`/items/${itemId}/description`, {
         plain_text: description,
      });

      return response;

   }

   async changeItemStatus(itemId: string, status: 'active' | 'paused'): Promise<AxiosResponse<any | MeliApiError>> {
      // try {
      const response = await this.request.put(`/items/${itemId}`, { status });

      return response;

   }

   async changeItemStock(itemId: string, newStock: number) {
      // try {
      const response = await this.request.put(`/items/${itemId}`, { available_quantity: newStock });

      return response;

   }

   async getItems(ids: string[], attrs?: ItemAttributes[]): Promise<AxiosResponse<GetItemsByIdsResponse[] | MeliApiError>> {
      const params = new URLSearchParams();

      params.append('ids', ids.join(','));

      if (attrs) {
         params.append('attributes', attrs.join(','));
      }

      // try {
      const response = await this.request.get<GetItemsByIdsResponse[]>(`/items`, { params });

      return response;

   }

   async getItem(itemId: string, attrs?: ItemAttributes[]): Promise<AxiosResponse<Partial<MeliItem> | MeliApiError>> {
      const params = new URLSearchParams();
      if (attrs) {
         params.append('attributes', attrs.join(','));
      }

      // try {s
      const response = await this.request.get<MeliItem>(`/items/${itemId}`, { params });

      return response;

   }

   async getItemIds(filters?: any) {

      if (!filters) {
         const response = await this.request.get(`/users/${this.sellerId}/items/search`);

         return response;
      }

      const params = new URLSearchParams()

      if (filters.status) {
         params.append('status', filters.status)
      }

      const response = await this.request.get(`/users/${this.sellerId}/items/search`, { params });

      return response;


   }


   async getUserInfo(userId: number) {
      // try {
      const response = await this.request.get(`/users/${userId}`);
      // console.log(response);

      return response;

   }

   async getOrders(filters?: string) {
      let url;

      switch (filters) {
         case 'recent':
            url = `/orders/search/recent?seller=${this.sellerId}&sort=date_desc`;
            break;
         case 'pending':
            url = `/orders/search/pending?seller=${this.sellerId}&sort=date_desc`;
            break;
         case 'archived':
            url = `/orders/search/archived?seller=${this.sellerId}&sort=date_desc`;
            break;
         default:
            url = `/orders/search?seller=${this.sellerId}&sort=date_desc`;
            break;
      }
      // order.date_created.from=2021-10-01T00:00:00.000-00:00&order.date_created.to=2021-12-31T00:00:00.000-00:00&sort=date_desc
      // try {
      const response = await this.request.get<OrdersSearchResponse>(url);

      // console.log(response);

      return response;

   }

   async getOrderInfo(orderId: number) {
      // try {
      const response = await this.request.get<MeliOrder>(`/orders/${orderId}`);

      return response;

   }

   async getOrderMessages(orderId: number) {
      // try {
      const response = await this.request.get(`/messages/packs/${orderId}/sellers/${this.sellerId}?mark_as_read=false&tag=post_sale`);

      return response;

   }

   async sendMessage(options: MeliSendMessageOptions) {
      // try {
      const response = await this.request.post(`/messages/packs/${options.msgGroupId}/sellers/${this.sellerId}?tag=post_sale`, {
         from: {
            user_id: this.sellerId,
         },
         to: {
            user_id: options.buyerId,
         },
         text: options.message,
      });

      return response;

   }

   async getResource(resource: string): Promise<AxiosResponse<any | MeliApiError>> {
      // try {
      const response = await this.request.get(`${resource}`);

      return response;

   }

   async getPackOrders(packId: number) {
      // try {
      const response = await this.request.get(`/packs/${packId}`);

      return response;
   }

   async getCategories(siteId = 'MLA') {
      const response = await this.request.get<CategoriesResponse>(`/sites/${siteId}/categories`)

      return response
   }

   async getCategoryDetails(categoryId: string) {
      const response = await this.request.get<CategoryDetails>(`/categories/${categoryId}`)

      return response
   }

   async getCategoryAttributes(categoryId: string) {
      const response = await this.request.get<CategoryAttributesResponse>(`/categories/${categoryId}/attributes`)

      return response
   }

   getAttributeFillerValue(attribute: Attribute): any {
      switch (attribute.value_type) {
         case 'string':
            return `${attribute.id} filler`
         case 'list':
            return attribute.values[0] || []
         case 'boolean':
            return {
               metadata: {
                  value: false
               }
            }
         case 'number':
            return Math.floor(Math.random() * 1000)
         case 'number_unit':
            return 25

      }
   }
}
