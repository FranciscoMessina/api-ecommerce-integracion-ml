import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, Repository } from 'typeorm';
import { Order } from '../entities/order.entity.js';
import { User } from '../entities/user.entity.js';
import { MeliFunctions } from '../meli/meli.functions.js';
import { FindOrdersOptions, SaleChannel } from '../types/orders.types.js';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
   configureMeli(config: { token: string; refresh: string; meliId: number; }) {
      this.meli.configure(config)
   }
   constructor(@InjectRepository(Order) private readonly ordersRepo: Repository<Order>, private readonly meli: MeliFunctions) { }

   create(createOrderDto: Partial<Order>, user: User) {
      const order = this.ordersRepo.create({
         ...createOrderDto,
         user,
      });
      return this.ordersRepo.save(order);
   }

   async find(userId: number, options?: FindOrdersOptions) {
      const limit = options?.limit || 25;
      const offset = options?.offset || 0;

      const ordersCount = await this.ordersRepo.count({ where: { user: { id: userId } } });
      const orders = await this.ordersRepo.find({
         where: {
            user: { id: userId },
         },
         take: limit,
         skip: offset,
         order: {
            createdAt: 'DESC',
         },
      });

      const mappedOrders = await Promise.all(
         orders.map(async (order) => {
            const meliItems: any = {};
            if (order.saleChannel === SaleChannel.ML || order.saleChannel === SaleChannel.MS) {
               const res = await this.meli.getItems(
                  order.items.map((item) => item.id),
                  ['title', 'secure_thumbnail', 'condition', 'id', 'permalink'],
               );

               if ('error' in res.data) throw new BadRequestException(res.data);

               res.data.forEach((res) => {
                  meliItems[res.body.id] = res.body;
               });
            }

            const mappedItems = order.items.map((item) => {
               return {
                  ...item,
                  ...meliItems[item.id],
               };
            });

            return {
               ...order,
               items: mappedItems,
            };
         }),
      );

      return {
         paging: {
            offset,
            limit,
            total: ordersCount,
         },
         results: mappedOrders,
      };
   }

   findOne(id: number) {
      return this.ordersRepo.findOneBy({ id });
   }

   update(id: number, updateOrderDto: UpdateOrderDto) {
      return this.ordersRepo.update(
         {
            id,
         },
         {
            ...updateOrderDto,
         },
      );
   }

   remove(id: number) {
      return this.ordersRepo.delete({ id });
   }

   findByMeliID(meliID: number) {
      return this.ordersRepo.findOne({
         where: {
            meliOrderIds: ArrayContains([meliID]),
         },
      });
   }

   findByCartId(cartId: number) {
      return this.ordersRepo.findOne({
         where: {
            cartId,
         },
      });
   }
}
