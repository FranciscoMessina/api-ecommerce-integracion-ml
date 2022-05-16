import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from '../orders/orders.module.js';
import { MeliController } from './meli.controller';
import { MeliFunctions } from './meli.functions';
import { MeliOauth } from './meli.oauth.js';
import { MeliService } from './meli.service';

@Module({
  imports: [
    UsersModule,
    OrdersModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: 120,
      }),
    }),
  ],
  controllers: [MeliController],
  providers: [MeliService, MeliFunctions, MeliOauth],
  exports: [MeliFunctions, MeliOauth, MeliService],
})
export class MeliModule {}
