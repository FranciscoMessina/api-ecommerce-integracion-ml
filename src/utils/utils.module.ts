import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service.js';
import { Crypto } from './crypto';

import { MailsService } from './mails.service.js';

@Global()
@Module({
  providers: [Crypto, MailsService, CacheService],
  exports: [Crypto, MailsService, CacheService],
})
export class UtilsModule {}
