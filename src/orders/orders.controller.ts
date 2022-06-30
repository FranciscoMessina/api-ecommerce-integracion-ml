import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js';
import { MeliGuard } from '../auth/guards/meli-config.guard.js';
import { User } from '../entities/user.entity.js';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, MeliGuard)
export class OrdersController {
   constructor(private readonly ordersService: OrdersService) { }

   @Post()
   create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: User) {
      return this.ordersService.create({ ...createOrderDto, user });
   }

   @Get()
   findAll(@CurrentUser() user: User) {
      this.ordersService.configureMeli({
         token: user.config.meliAccess,
         refresh: user.config.meliRefresh,
         meliId: user.config.meliId,
      });
      return this.ordersService.find(user.id);
   }

   @Get(':id')
   findOne(@Param('id') id: string) {
      return this.ordersService.findOne(+id);
   }

   @Patch(':id')
   update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
      return this.ordersService.update(+id, updateOrderDto);
   }

   @Delete(':id')
   remove(@Param('id') id: string) {
      return this.ordersService.remove(+id);
   }
}
