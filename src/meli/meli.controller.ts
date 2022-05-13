import {
  BadRequestException,
  Body,
  CacheKey,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  Sse,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { MeliGuard } from 'src/auth/guards/meli-config.guard';
import { HttpCacheInterceptor } from '../interceptors/http-cache.interceptor.js';
import { AnswerQuestionDto } from './dto/answer-question.dto.js';
import { MeliNotificationDto } from './dto/meli-notification.dto';
import { MeliOauthQueryDto } from './dto/meli-oauth-query.dto';
import { QuestionsFiltersDto } from './dto/questions-filters.dto';
import { MeliService } from './meli.service';

@Controller('meli')
@UseGuards(MeliGuard)
@UseGuards(JwtAuthGuard)
export class MeliController {
  constructor(private readonly meliService: MeliService, private config: ConfigService, private emitter: EventEmitter2) {}

  @Get('oauth/callback')
  @Public()
  async meliCallback(@Query() { code, state, error }: MeliOauthQueryDto, @Res() res: Response) {
    if (error) {
      return res.redirect(`${this.config.get('APP_CALLBACK_URL')}?error=${error || 'unknown'}`);
    }

    const user = await this.meliService.meliCallback({ code, state });

    if (user.config.meliAccess) return res.redirect(`${this.config.get('APP_CALLBACK_URL')}`);

    return res.redirect(`${this.config.get('APP_CALLBACK_URL')}`);
  }

  @Post('notifications')
  @Public()
  async meliNotifications(@Body() notification: MeliNotificationDto, @Res() res: Response) {
    res.status(200).send(notification);

    // console.log('Lleggo una notifccc');

    return this.meliService.handleNotification(notification);
  }

  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('questions')
  @Get('questions')
  getQuestions(@Query() query: QuestionsFiltersDto) {
    if (!!query.history) {
      return this.meliService.getQuestionsHistory(query);
    }

    return this.meliService.getUnansweredQuestions(query);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.meliService.deleteQuestion(id);
  }

  @Post('answers')
  async answerQuestion(@Body() body: AnswerQuestionDto) {
    console.log(body);
    
    return this.meliService.answerQuestion(body);
  }

  @Patch('items/:id/pause')
  async pauseItem(@Param('id') id: string) {
    return this.meliService.pauseItem(id);
  }

  @Patch('items/:id/activate')
  async activateItem(@Param('id') id: string) {
    return this.meliService.activateItem(id);
  }

  @Get('items/search')
  async searchItems(@Query('q') q: string) {
    if (!q) throw new BadRequestException('Query is required');

    return this.meliService.searchItems(q);
  }

  @Get('orders')
  async getOrders() {
    return this.meliService.getOrders();
  }

  @Sse('updates')
  @Public()
  getEvents(@Query('id') id: string) {
    return this.meliService.sendNotifications(id);
  }
}
