import { Module } from '@nestjs/common';
import { MeliModule } from '../meli/meli.module';
import { UsersModule } from '../users/users.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
   imports: [MeliModule, UsersModule],
   controllers: [ItemsController],
   providers: [ItemsService],
})
export class ItemsModule { }
