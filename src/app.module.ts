import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { Order } from './entities/order.entity.js';
import { QuickAnswer } from './entities/quickanswer.entity.js';
import { UserConfig } from './entities/user-config.entity.js';
import { User } from './entities/user.entity.js';
import { MeliModule } from './meli/meli.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { ItemsModule } from './items/items.module';
import { BillingModule } from './billing/billing.module';
import { Invoice } from './entities/invoice.entity';
import { Book } from './entities/book.entity';

const validationSchema = Joi.object({
   MELI_CLIENT_ID: Joi.number().required(),
   MELI_CLIENT_SECRET: Joi.string().required(),
   MELI_API_URL: Joi.string().required(),
   MELI_API_REDIRECT_URL: Joi.string().required(),
   APP_CALLBACK_URL: Joi.string().required(),
   PG_CONNECTION_URL: Joi.string().required(),
   ENCRYPTION_KEY: Joi.string().required(),
   JWT_ACCESS_SECRET: Joi.string().required(),
   JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
   JWT_REFRESH_SECRET: Joi.string().required(),
   JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
   PORT: Joi.number().required(),
   REDIS_CONNECTION_URL: Joi.string().required(),
   CORS_ORIGINS: Joi.string().required(),
   EMAIL: Joi.string().required(),
   EMAIL_PW: Joi.string().required(),
   EMAIL_SERVICE: Joi.string().required(),
   REDIS_HOST: Joi.string().required(),
   REDIS_PORT: Joi.number().required(),
});

@Module({
   imports: [
      ConfigModule.forRoot({
         envFilePath: process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
         isGlobal: true,
         validationSchema,
      }),
      TypeOrmModule.forRootAsync({
         imports: [ConfigModule],
         inject: [ConfigService],
         useFactory: (config: ConfigService) => ({
            type: 'postgres',
            url: config.get('PG_CONNECTION_URL'),
            entities: [User, Order, QuickAnswer, UserConfig, Invoice],
            synchronize: true,
         }),
      }),
      EventEmitterModule.forRoot({
         global: true,
         wildcard: true,
         delimiter: '.',
      }),
      BullModule.forRootAsync({
         imports: [ConfigModule],
         inject: [ConfigService],
         useFactory: (config: ConfigService) => ({
            redis: {
               host: config.get('REDIS_HOST'),
               port: config.get('REDIS_PORT'),
            },
         }),
      }),
      UsersModule,
      MeliModule,
      AuthModule,
      UtilsModule,
      OrdersModule,
      ItemsModule,
      BillingModule,
   ],
   controllers: [AppController],
})
export class AppModule { }
