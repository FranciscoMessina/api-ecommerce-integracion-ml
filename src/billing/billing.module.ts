import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { MeliModule } from '../meli/meli.module';
import { UsersModule } from '../users/users.module';

@Module({
   imports: [MeliModule, UsersModule],
   controllers: [BillingController],
   providers: [BillingService],
})
export class BillingModule { }
