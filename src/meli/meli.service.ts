import { BadRequestException, forwardRef, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { CryptoService } from 'src/utils/crypto';
import { MailsService } from 'src/utils/mails.service';
import { User } from '../entities/user.entity.js';
import { OrdersService } from '../orders/orders.service.js';
import { MeliMessage, MeliNotification, MeliNotificationTopic } from '../types/meli.types';
import { MeliOrder, SaleChannel } from '../types/orders.types.js';
import { AnsweredQuestion, UnansweredQuestion } from '../types/questions.types.js';
import { CacheService } from '../utils/cache.service.js';
import { sleep } from '../utils/sleep.js';
import { AnswerQuestionDto } from './dto/answer-question.dto.js';
import { CreateQuickItemDTO } from './dto/create-quick-item.dto.js';
import { MeliOauthQueryDto } from './dto/meli-oauth-query.dto';
import { QuestionsFiltersDto } from './dto/questions-filters.dto.js';
import { MeliFunctions } from './meli.functions';
import { MeliOauth } from './meli.oauth.js';

@Injectable()
export class MeliService {

   constructor(
      @Inject(forwardRef(() => OrdersService)) private readonly ordersService: OrdersService,
      private readonly meli: MeliFunctions,
      private readonly users: UsersService,
      private readonly mails: MailsService,
      private readonly emitter: EventEmitter2,
      private readonly crypto: CryptoService,
      private readonly meliOauth: MeliOauth,
      private readonly cache: CacheService,
   ) { }

   configure(config: { token: string; refresh: string; meliId: number }) {
      return this.meli.configure(config);
   }

   async createQuickItem(data: CreateQuickItemDTO) {
      const attributes = []

      if (data.channels.length === 1) {
         attributes.push({
            id: 'EXCLUSIVE_CHANNEL',
            value_name: data.channels[0]
         })
      }

      const attributesRes = await this.meli.getCategoryAttributes(data.subCategory)


      if ('error' in attributesRes.data) {
         throw new HttpException(attributesRes.data, attributesRes.status)
      }

      attributesRes.data.map(attr => {
         if (attr.tags.required) {
            attributes.push({
               id: attr.id,
               value_name: this.meli.getAttributeFillerValue(attr)
            })
         }
      })

      try {
         const item = await this.meli.createItem({
            title: data.title, price: data.price, category_id: data.subCategory, listing_type_id: 'gold_special', buying_mode: 'buy_it_now', currency_id: 'ARS', available_quantity: 1, condition: data.condition, pictures: [
               {
                  source: 'http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg',
               },
            ],
            attributes,
            shipping: {
               free_shipping: data.free_shipping
            }
         })

         if (typeof item === 'undefined') {
            throw new InternalServerErrorException()
         }

         if ('error' in item.data) {
            throw new HttpException(item.data, item.status)
         }

         return item.data

      } catch (err) {
         console.log(err);

         throw new HttpException(err, err.status)

      }
   }


   async createItem() {
      const item = {
         title: `Item de test - No Ofertar - Porfavor no ofertar`,
         category_id: 'MLA3530',
         price: 10000,
         currency_id: 'ARS',
         available_quantity: Math.floor(Math.random() * 100),
         buying_mode: 'buy_it_now',
         condition: 'new',
         listing_type_id: 'gold_special',
         sale_terms: [
            {
               id: 'WARRANTY_TYPE',
               value_name: 'Garantía del vendedor',
            },
            {
               id: 'WARRANTY_TIME',
               value_name: '90 días',
            },
         ],
         pictures: [
            {
               source: 'http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg',
            },
         ],
         attributes: [
            {
               id: 'BRAND',
               value_name: 'Marca del producto',
            },
         ],
      };

      try {
         const array = Array(10).fill(1);

         for (let index = 0; index < array.length; index++) {
            try {
               await this.meli.createItem({ ...item, price: item.price + index });
            } catch (err) {
               console.log({ [index]: err });
            }
         }

         return 'finished';
      } catch (err) {
         console.log(err);
         return 'ERRORRRR';
      }
   }

   async listItems() {
      const res = await this.meli.getItemIds();

      if ('error' in res.data) {
         throw new HttpException(res.data, res.status)
      }

      if (res.data === undefined) {
         throw new InternalServerErrorException()
      }

      const mappedItems = await Promise.all(res.data.results.map(async (id: string) => {
         const response = await this.meli.getItem(id, ['attributes', 'shipping', 'secure_thumbnail', 'permalink', 'price', 'available_quantity', 'sold_quantity', 'condition', 'status', 'title', 'id', 'channels'])


         if (typeof response === 'undefined') {
            return {
               error: true,
               message: `Could not fetch item ${id}`,
            }
         }

         const { data } = response

         if ('error' in data) {
            return {
               error: true,
               message: `Could not fetch item ${id}`,
               rawData: data
            }
         }

         return data
      }))


      return {
         query: res.data.query,
         paging: {
            limit: res.data.paging.limit,
            offset: res.data.paging.offset,
            total: res.data.paging.total,
         },
         results: mappedItems
      };
   }

   async getQuestionsHistory(query: QuestionsFiltersDto) {
      const { data } = await this.meli.getQuestions({
         ...query,
         status: 'ANSWERED',
         sort: {
            fields: 'date_created',
            order: 'DESC',
         },
      });

      if (typeof data.questions === undefined) throw new BadRequestException(data);

      const mappedQuestionsWithItems = await Promise.all(
         data.questions.map(async (question: AnsweredQuestion) => {
            const { data: item } = await this.meli.getItem(question.item_id, [
               'id',
               'title',
               'price',
               'available_quantity',
               'permalink',
               'secure_thumbnail',
               'status',
               'attributes',
               'shipping',
            ]);

            if ('error' in item) {
               throw new BadRequestException(`No se pudo obtener el item ${question.item_id}`);
            }

            const { data: buyer } = await this.meli.getUserInfo(question.from.id);

            const SKU = item.attributes.find((attr) => attr.id === 'SELLER_SKU');

            const condition = item.attributes.find((attr) => attr.id === 'ITEM_CONDITION');

            const finalData = {
               ...question,
               item: {
                  id: item.id,
                  title: item.title,
                  price: item.price,
                  available_quantity: item.available_quantity,
                  permalink: item.permalink,
                  secure_thumbnail: item.secure_thumbnail,
                  status: item.status,
                  shipping: item.shipping,
                  condition,
                  SKU,
               },
               from: {
                  id: buyer.id,
                  nickname: buyer.nickname,
                  city: buyer.address.city,
               },
            };

            return finalData;
         }),
      );

      return {
         offset: data.filters.offset,
         limit: data.limit,
         total: data.total,
         next: data.limit + data.filters.offset < data.total ? `/meli/questions?history=true&offset=${data.limit + data.filters.offset}` : '',
         results: mappedQuestionsWithItems,
      };
   }

   async handleNotification(notification: MeliNotification) {
      const user = await this.users.findByMeliId(notification.user_id);
      console.log({ notification: notification.topic });

      if (!user || !user.config.meliAccess || !user.config.meliRefresh) return;

      this.configure({
         token: this.crypto.decrypt(user.config.meliAccess),
         refresh: this.crypto.decrypt(user.config.meliRefresh),
         meliId: user.config.meliId,
      });


      if (notification.topic === MeliNotificationTopic.ORDERS) {
         await this.handleOrderNotification(notification, user);
      }

      if (notification.topic === MeliNotificationTopic.QUESTIONS) {
         await this.cache.clearCache('questions', notification.user_id);
         await sleep(500);
         await this.emitter.emitAsync(`notif-${user.id}`, { data: { ...notification, id: user.id } });
      }

      return;
   }
   async handleOrderNotification(notification: MeliNotification, user: User) {
      try {
         const response = await this.meli.getResource(notification.resource);

         if ('error' in response) return;

         const order = response.data as MeliOrder;

         if (order === undefined) return;

         if (order.status === 'paid' && order.shipping.id === null) {
            await this.sendOrderMessage(order, user);
         }

         let dbOrder;

         if (order.pack_id) {
            dbOrder = await this.ordersService.findByCartId(order.pack_id);
         } else {
            dbOrder = await this.ordersService.findByMeliID(order.id);
         }

         if (!dbOrder) {
            let meliOrderIds = [];

            if (order.pack_id) {
               const packInfo = await this.meli.getPackOrders(order.pack_id);

               meliOrderIds = packInfo.data.orders.map((order: any) => order.id);
            } else {
               meliOrderIds.push(order.id);
            }

            const saleChannel = order.context.channel === 'marketplace' ? SaleChannel.ML : SaleChannel.MS;

            dbOrder = await this.ordersService.create({
               saleChannel,
               meliOrderIds,
               buyer: {
                  id: order.buyer.id,
                  nickname: order.buyer.nickname,
                  first_name: order.buyer.first_name,
                  last_name: order.buyer.last_name,
               },
               shippingId: order.shipping.id || null,
               cartId: order.pack_id || null,
               items: order.order_items.map((item) => ({
                  id: item.item.id,
                  quantity: item.quantity,
                  price: item.unit_price,
               })),
               user,
            });
         }
      } catch (err) {
         console.log({ err });
      } finally {
         await this.emitter.emitAsync(`notif-${user.id}`, { data: { ...notification, id: user.id } });
      }
   }

   async sendOrderMessage(order: MeliOrder, user: User) {
      if (user.config.autoMessage.enabled && user.config.autoMessage.message) {
         const { data: orderMsgs } = await this.meli.getOrderMessages(order.id);

         const sellerMsgSent = orderMsgs.messages.some((msg: MeliMessage) => msg.from.user_id === order.seller.id);

         if (sellerMsgSent) return;

         let message = user.config.autoMessage.message.replace('@USUARIO', order.buyer.nickname || '');
         message = message.replace('@NOMBRE', order.buyer.first_name || '');
         message = message.replace('@PRODUCTO', order.order_items?.[0].item.title || '');

         const urlRegex =
            /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;

         const linksFound = message.match(urlRegex);

         linksFound?.forEach((link) => {
            message = message.replace(link, `<a href="${link}">${link}</a>`);
         });

         await this.meli.sendMessage({
            buyerId: order.buyer.id,
            message,
            msgGroupId: order.id,
         });
         return;
      } else {
         return;
      }
   }

   sendNotifications(id: string) {
      return fromEvent(this.emitter, `notif-${id}`);
   }

   async getOrders() {
      const { data } = await this.meli.getOrders();

      if (typeof data === undefined) throw new BadRequestException();

      if ('error' in data) throw new BadRequestException(data);

      const mappedOrders = await Promise.all(
         data.results.map(async (order) => {
            const { data: item } = await this.meli.getItem(order.order_items[0].item.id, [
               'id',
               'title',
               'price',
               'secure_thumbnail',
               'permalink',
            ]);

            if ('error' in item) throw new BadRequestException(item);

            const { data: buyer } = await this.meli.getUserInfo(order.buyer.id);

            const order_items = order.order_items.map((element) => ({
               ...element,
               item: {
                  ...element.item,
                  ...item,
                  thumbnail: item.secure_thumbnail,
               },
            }));

            return {
               ...order,
               order_items,
               buyer,
            };
         }),
      );

      return {
         paging: data.paging,
         results: mappedOrders,
      };
   }

   async searchItems(q: string) {
      const { data } = await this.meli.searchForItems(q);

      // console.log(data);

      if (typeof data === undefined) throw new BadRequestException();

      if ('error' in data) throw new BadRequestException(data);

      if (data.results.length === 0) throw new NotFoundException('No se encontraron resultados');

      let items;
      if (data.results.length > 20) {
         const { data: itemData1 } = await this.meli.getItems(data.results.slice(0, 19), [
            'id',
            'permalink',
            'title',
            'secure_thumbnail',
            'price',
         ]);

         const { data: itemData2 } = await this.meli.getItems(data.results.slice(20, 39), [
            'id',
            'permalink',
            'title',
            'secure_thumbnail',
            'price',
         ]);

         if ('error' in itemData1 || 'error' in itemData2) throw new BadRequestException(items);

         items = itemData1.concat(itemData2);
      } else {
         const { data: itemData } = await this.meli.getItems(data.results, ['id', 'permalink', 'title', 'secure_thumbnail', 'price']);

         if ('error' in itemData) throw new BadRequestException(items);

         items = itemData;
      }

      // console.log(items);

      return {
         paging: data.paging,
         results: items.map((a) => a.body),
      };
   }
   async activateItem(id: string) {
      const { data } = await this.meli.changeItemStatus(id, 'active')

      if (typeof data === undefined) throw new BadRequestException();

      if ('error' in data) throw new BadRequestException(data);

      await this.cache.clearCache('questions', this.meli.sellerId);

      return data;
   }
   async pauseItem(id: string) {
      const { data } = await this.meli.changeItemStatus(id, 'paused');

      if (typeof data === undefined) throw new BadRequestException();

      if ('error' in data) throw new BadRequestException(data);

      await this.cache.clearCache('questions', this.meli.sellerId);

      return data;
   }

   async answerQuestion({ answer, id }: AnswerQuestionDto) {
      const { data } = await this.meli.answerQuestion({ id, answer });

      if ('error' in data) throw new BadRequestException(data);

      return data;
   }

   async deleteQuestion(id: string) {
      const { data } = await this.meli.deleteQuestion(+id);

      console.log(data);

      if ('error' in data) throw new BadRequestException(data);

      return data;
   }

   async getUnansweredQuestions(options?: QuestionsFiltersDto) {
      const { data } = await this.meli.getQuestions({
         status: 'UNANSWERED',
         limit: options.limit || 25,
         offset: options.offset || 0,
      });

      if (typeof data.questions === undefined) throw new BadRequestException();

      // const groupedData = groupBy(data.questions, 'item_id');

      // const dataToSend: any[] = [];

      // for (const key in groupedData) {
      //   const { data: item } = await this.meli.getItem(key, [
      //     'id',
      //     'title',
      //     'price',
      //     'available_quantity',
      //     'permalink',
      //     'secure_thumbnail',
      //     'shipping',
      //     'status',
      //     'attributes',
      //   ]);

      //   if ('error' in item) throw new BadRequestException(item);

      //   const mappedQuestionsWithPrevious = await Promise.all(
      //     groupedData[key].map(async (question) => {
      //       const { data: answeredQuestions } = await this.meli.getQuestions({
      //         status: 'ANSWERED',
      //         from: question.from.id,
      //         item: question.item_id,
      //       });

      //       const { data: buyer } = await this.meli.getUserInfo(question.from.id);

      //       const minifiedPreviousQuestions = answeredQuestions.questions.map((question: AnsweredQuestion) => {
      //         const quest = {
      //           text: question.text,
      //           answer: {
      //             text: question.answer.text,
      //             date_created: question.answer.date_created,
      //           },
      //           date_created: question.date_created,
      //           status: question.status,
      //         };

      //         return quest;
      //       });

      //       const finalData = {
      //         ...question,
      //         previous: {
      //           limit: answeredQuestions.limit,
      //           total: answeredQuestions.total,
      //           offset: answeredQuestions.filters.offset,
      //           results: minifiedPreviousQuestions,
      //         },
      //         from: {
      //           id: buyer.id,
      //           nickname: buyer.nickname,
      //           city: buyer.address.city,
      //         },
      //       };

      //       return finalData;
      //     }),
      //   );

      //   const SKU = item.attributes.find((attr) => attr.id === 'SELLER_SKU');

      //   const condition = item.attributes.find((attr) => attr.id === 'ITEM_CONDITION');

      //   dataToSend.push({
      //     id: item.id,
      //     questions: mappedQuestionsWithPrevious,
      //     item: {
      //       id: item.id,
      //       title: item.title,
      //       price: item.price,
      //       available_quantity: item.available_quantity,
      //       permalink: item.permalink,
      //       secure_thubmnail: item.secure_thumbnail,
      //       shipping: item.shipping,
      //       status: item.status,
      //       condition,
      //       SKU,
      //     },
      //   });
      // }

      // return {
      //   offset: data.filters.offset,
      //   limit: data.limit,
      //   total: data.total,
      //   next: data.limit + data.filters.offset < data.total ? `/meli/questions?offset=${data.limit + data.filters.offset}` : '',
      //   results: dataToSend,
      // };

      const mappedQuestionsWithPreviousAndUser = await Promise.all(
         data.questions.map(async (question: UnansweredQuestion) => {
            const { data: answeredQuestions } = await this.meli.getQuestions({
               status: 'ANSWERED',
               from: question.from.id,
               item: question.item_id,
            });

            const { data: item } = await this.meli.getItem(question.item_id, [
               'id',
               'title',
               'price',
               'available_quantity',
               'permalink',
               'secure_thumbnail',
               'shipping',
               'status',
               'attributes',
            ]);

            if ('error' in item) {
               throw new BadRequestException(`No se pudo obtener el item ${question.item_id}`);
            }

            const { data: buyer } = await this.meli.getUserInfo(question.from.id);

            const minifiedPreviousQuestions = answeredQuestions.questions.map((question: AnsweredQuestion) => {
               const quest = {
                  text: question.text,
                  answer: {
                     text: question.answer.text,
                     date_created: question.answer.date_created,
                  },
                  date_created: question.date_created,
                  status: question.status,
               };

               return quest;
            });

            const SKU = item.attributes.find((attr) => attr.id === 'SELLER_SKU');

            const condition = item.attributes.find((attr) => attr.id === 'ITEM_CONDITION');

            return {
               ...question,
               item: {
                  id: item.id,
                  title: item.title,
                  price: item.price,
                  available_quantity: item.available_quantity,
                  permalink: item.permalink,
                  secure_thumbnail: item.secure_thumbnail,
                  shipping: item.shipping,
                  status: item.status,
                  condition,
                  SKU,
               },
               previous: {
                  limit: answeredQuestions.limit,
                  total: answeredQuestions.total,
                  offset: answeredQuestions.filters.offset,
                  results: minifiedPreviousQuestions,
               },
               from: {
                  id: buyer.id,
                  nickname: buyer.nickname,
                  city: buyer.address.city,
               },
            };
         }),
      );

      return {
         offset: data.filters.offset,
         limit: data.limit,
         total: data.total,
         next: data.limit + data.filters.offset < data.total ? `/meli/questions?offset=${data.limit + data.filters.offset}` : '',
         results: mappedQuestionsWithPreviousAndUser,
      };
   }

   async meliCallback({ code, state }: MeliOauthQueryDto) {
      const user = await this.users.findById(state);

      if (!user) throw new NotFoundException('User not found');

      const response = await this.meliOauth.getAccessToken(code);

      if ('error' in response.data) throw new BadRequestException(response.data);

      user.config.meliAccess = this.crypto.encrypt(response.data.access_token);
      user.config.meliRefresh = this.crypto.encrypt(response.data.refresh_token);

      user.config.meliTokenExpires = Date.now() + response.data.expires_in * 1000;

      user.config.meliId = response.data.user_id;

      return this.users.save(user);
   }

   async getCategories() {
      return (await this.meli.getCategories()).data
   }


   async getSubCategories(categoryId: string) {
      const response = await this.meli.getCategoryDetails(categoryId)

      if ('error' in response.data) {
         throw new HttpException(response.data, response.status)
      }
      return response.data.children_categories
   }
}
