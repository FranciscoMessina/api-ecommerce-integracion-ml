import {
   BadRequestException,
   Body, Controller,
   Delete,
   Get,
   Param,
   Patch,
   Post,
   Query,
   Res,
   Sse,
   UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { MeliGuard } from 'src/auth/guards/meli-config.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../entities/user.entity.js';
import { AnswerQuestionDto } from './dto/answer-question.dto.js';
import { CreateQuickItemDTO } from './dto/create-quick-item.dto.js';
import { MeliNotificationDto } from './dto/meli-notification.dto';
import { MeliOauthQueryDto } from './dto/meli-oauth-query.dto';
import { QuestionsFiltersDto } from './dto/questions-filters.dto';
import { MeliService } from './meli.service';

@Controller('meli')
@UseGuards(JwtAuthGuard, MeliGuard)
export class MeliController {
   constructor(private readonly meliService: MeliService, private config: ConfigService, private emitter: EventEmitter2) { }

   @Public()
   @Get('oauth/callback')
   async meliCallback(@Query() { code, state, error }: MeliOauthQueryDto, @Res() res: Response) {
      if (error) {
         return res.redirect(`${this.config.get('APP_CALLBACK_URL')}?error=${error || 'unknown'}`);
      }

      const user = await this.meliService.meliCallback({ code, state });

      if (user.config.meliAccess) return res.redirect(`${this.config.get('APP_CALLBACK_URL')}`);

      return res.redirect(`${this.config.get('APP_CALLBACK_URL')}`);
   }

   @Public()
   @Post('notifications')
   async meliNotifications(@Body() notification: MeliNotificationDto, @Res() res: Response) {
      res.status(200).send(notification);

      return this.meliService.handleNotification(notification);
   }

   @Get('questions')
   getQuestions(@Query() query: QuestionsFiltersDto, @CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });

      if (!!query.history) {
         return this.meliService.getQuestionsHistory(query);
      }

      return this.meliService.getUnansweredQuestions(query);
   }

   @Delete('questions/:id')
   async deleteQuestion(@Param('id') id: string, @CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });
      return this.meliService.deleteQuestion(id);
   }

   @Post('answers')
   async answerQuestion(@Body() body: AnswerQuestionDto, @CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });

      return this.meliService.answerQuestion(body);
   }

   @Patch('items/:id/pause')
   async pauseItem(@Param('id') id: string, @CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });
      return this.meliService.pauseItem(id);
   }

   @Patch('items/:id/activate')
   async activateItem(@Param('id') id: string, @CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });
      return this.meliService.activateItem(id);
   }

   @Get('items/search')
   async searchItems(@Query('q') q: string, @CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });
      if (!q) throw new BadRequestException('Query is required');

      return this.meliService.searchItems(q);
   }

   @Get('items')
   async getItems(@CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });
      return this.meliService.listItems();
   }

   @Get('orders')
   async getOrders(@CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });
      return this.meliService.getOrders();
   }

   @Post('publicar')
   async publicar(@CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });
      return this.meliService.createItem();
   }

   @Post('items/quick')
   async createNewQuickItem(@Body() data: CreateQuickItemDTO, @CurrentUser() user: User) {
      this.meliService.configure({
         meliId: user.config.meliId,
         refresh: user.config.meliRefresh,
         token: user.config.meliAccess,
      });

      return this.meliService.createQuickItem(data)

   }


   @Public()
   @Sse('updates')
   getEvents(@Query('id') id: string) {
      return this.meliService.sendNotifications(id);
   }
}
