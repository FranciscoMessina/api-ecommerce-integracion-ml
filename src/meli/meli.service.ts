import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent } from 'rxjs';
import { Crypto } from 'src/utils/crypto';
import { MailsService } from 'src/utils/mails.service';
import { UsersService } from 'src/users/users.service';
import { User } from '../entities/user.entity.js';
import { sleep } from '../utils/sleep.js';
import {
  AnsweredQuestion,
  MeliMessage,
  MeliNotification,
  MeliNotificationEvent,
  MeliNotificationTopic,
  MeliOrder,
  UnansweredQuestion,
} from '../types/meli.types';
import { AnswerQuestionDto } from './dto/answer-question.dto.js';
import { MeliOauthQueryDto } from './dto/meli-oauth-query.dto';
import { QuestionsFiltersDto } from './dto/questions-filters.dto.js';
import { MeliFunctions } from './meli.functions';
import { MeliOauth } from './meli.oauth.js';
import { CacheService } from '../utils/cache.service.js';

@Injectable()
export class MeliService {
  constructor(
    private readonly meliFunctions: MeliFunctions,
    private readonly usersService: UsersService,
    private readonly mailService: MailsService,
    private readonly emitter: EventEmitter2,
    private readonly crypto: Crypto,
    private readonly meliOauth: MeliOauth,
    private readonly cache: CacheService,
  ) {}

  async getQuestionsHistory(query: QuestionsFiltersDto) {
    const { data } = await this.meliFunctions.getQuestions({
      ...query,
      status: 'ANSWERED',
      sort: {
        fields: 'date_created',
        order: 'DESC',
      },
    });

    if (typeof data.questions === undefined) throw new InternalServerErrorException();

    const mappedQuestionsWithItems = await Promise.all(
      data.questions.map(async (question: UnansweredQuestion) => {
        const { data: item } = await this.meliFunctions.getItem(question.item_id, [
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
          throw new InternalServerErrorException(`No se pudo obtener el item ${question.item_id}`);
        }

        const { data: buyer } = await this.meliFunctions.getUserInfo(question.from.id);

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
            thumbnail: item.secure_thumbnail,
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
    const user = await this.usersService.findByMeliId(notification.user_id);
    // console.log({ notification });
    console.log({ notification });

    if (!user || !user.config.meliAccess || !user.config.meliRefresh) return;

    if (notification.topic === MeliNotificationTopic.ORDERS) {
      await this.handleOrderNotification(notification, user);
      await this.emitter.emitAsync(`notif-${user.id}`, { data: { notification, user } });
    }

    if (notification.topic === MeliNotificationTopic.QUESTIONS) {
      await this.cache.clearCache('questions', notification.user_id);
      await sleep(1000);
      await this.emitter.emitAsync(`notif-${user.id}`, { data: { ...notification, id: user.id } });
    }

    return;
  }
  async handleOrderNotification(notification: MeliNotification, user: User) {
    let ML: MeliFunctions; // new MeliFunctions()

    const { data: order } = await ML.getResource(notification.resource);

    if (order === undefined) return;
    if ('error' in order) return;

    if (order.status === 'paid' && order.shipping.id === null) {
      if (user.config.autoMessage.enabled && user.config.autoMessage.message) {
        const { data: orderMsgs } = await ML.getOrderMessages(order.id);

        const sellerMsgSent = orderMsgs.messages.some((msg: MeliMessage) => msg.from.user_id === order.seller.id);

        if (sellerMsgSent) return;

        let message = user.config.autoMessage.message.replace('@USUARIO', order.buyer.nickname || '');
        message = message.replace('@NOMBRE', order.buyer.first_name || '');
        message = message.replace('@PRODUCTO', order.items[0].title || '');

        const urlRegex =
          /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;

        const linksFound = message.match(urlRegex);

        linksFound?.forEach((link) => {
          message = message.replace(link, `<a href="${link}">${link}</a>`);
        });

        await ML.sendMessage({
          buyerId: order.buyer.id,
          message,
          msgGroupId: order.id,
        });
      }
    }
  }

  sendNotifications(id: string) {
    return fromEvent(this.emitter, `notif-${id}`);
  }

  async getOrders() {
    const { data } = await this.meliFunctions.getOrders();

    if (typeof data === undefined) throw new InternalServerErrorException();

    if ('error' in data) throw new BadRequestException(data);

    const mappedOrders = await Promise.all(
      data.results.map(async (order: MeliOrder) => {
        const { data: item } = await this.meliFunctions.getItem(order.order_items[0].item.id, [
          'id',
          'title',
          'price',
          'secure_thumbnail',
          'permalink',
        ]);

        if ('error' in item) throw new InternalServerErrorException(item);

        const { data: buyer } = await this.meliFunctions.getUserInfo(order.buyer.id);

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
    const { data } = await this.meliFunctions.searchForItems(q);

    // console.log(data);

    if (typeof data === undefined) throw new InternalServerErrorException();

    if ('error' in data) throw new InternalServerErrorException(data);

    const items = await Promise.all(
      data.results.map(async (id: string) => {
        const { data } = await this.meliFunctions.getItem(id);
        return data;
      }),
    );

    return {
      paging: data.paging,
      results: items,
    };
  }
  async activateItem(id: string) {
    const { data } = await this.meliFunctions.activateItem(id);

    // console.log(data);

    if (typeof data === undefined) throw new InternalServerErrorException();

    if ('error' in data) throw new InternalServerErrorException(data);

    return data;
  }
  async pauseItem(id: string) {
    const { data } = await this.meliFunctions.pauseItem(id);

    // console.log(data);

    if (typeof data === undefined) throw new InternalServerErrorException();

    if ('error' in data) throw new InternalServerErrorException(data);

    return data;
  }

  async answerQuestion({ answer, id }: AnswerQuestionDto) {
    const { data } = await this.meliFunctions.answerQuestion({ id, answer });

    if ('error' in data) throw new InternalServerErrorException(data);

    return data;
  }

  async deleteQuestion(id: string) {
    const { data } = await this.meliFunctions.deleteQuestion(+id);

    console.log(data);

    if ('error' in data) throw new InternalServerErrorException(data);

    return data;
  }

  async getUnansweredQuestions(options?: QuestionsFiltersDto) {
    const { data } = await this.meliFunctions.getQuestions({
      status: 'UNANSWERED',
      limit: options.limit || 25,
      offset: options.offset || 0,
    });

    // return data

    if (typeof data.questions === undefined) throw new InternalServerErrorException();

    const mappedQuestionsWithPreviousAndUser = await Promise.all(
      data.questions.map(async (question: UnansweredQuestion) => {
        const { data: answeredQuestions } = await this.meliFunctions.getQuestions({
          status: 'ANSWERED',
          from: question.from.id,
          item: question.item_id,
          limit: 10,
        });

        const { data: item } = await this.meliFunctions.getItem(question.item_id, [
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
          throw new InternalServerErrorException(`No se pudo obtener el item ${question.item_id}`);
        }

        const { data: buyer } = await this.meliFunctions.getUserInfo(question.from.id);

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

        const finalData = {
          ...question,
          item: {
            id: item.id,
            title: item.title,
            price: item.price,
            available_quantity: item.available_quantity,
            permalink: item.permalink,
            thumbnail: item.secure_thumbnail,
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

        return finalData;
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
  meliNotifications() {
    throw new Error('Method not implemented.');
  }
  async meliCallback({ code, state }: MeliOauthQueryDto) {
    const user = await this.usersService.findById(state);

    if (!user) throw new NotFoundException('User not found');

    const response = await this.meliOauth.getAccessToken(code);

    if ('error' in response.data) throw new BadRequestException(response.data);

    this.mailService.sendMail({
      to: 'fm230499@gmail.com',
      from: 'razioner@gmail.com',
      subject: 'New Meli Link',
      // text: JSON.stringify(response.data),
      text: ' Helloo',
    });

    user.config.meliAccess = this.crypto.encrypt(response.data.access_token);
    user.config.meliRefresh = this.crypto.encrypt(response.data.refresh_token);

    user.config.meliTokenExpires = Date.now() + response.data.expires_in * 1000;

    user.config.meliId = response.data.user_id;

    return this.usersService.save(user);
  }

  async sendOrderMessage({ notification, user }: MeliNotificationEvent) {
    console.log(notification, user);

    return true;
  }
}
