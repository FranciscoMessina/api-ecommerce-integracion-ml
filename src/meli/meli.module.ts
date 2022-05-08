import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { MeliController } from './meli.controller';
import { MeliFunctions } from './meli.functions';
import { MeliOauth } from './meli.oauth.js';
import * as redisStore from 'cache-manager-redis-store'
import { MeliService } from './meli.service';

@Module({
  imports: [
    UsersModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: 120
      }),
    }),
  ],
  controllers: [MeliController],
  providers: [MeliService, MeliFunctions, MeliOauth],
  exports: [MeliFunctions, MeliOauth],
})
export class MeliModule {}
