import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, Repository } from 'typeorm';
import { Order } from '../entities/order.entity.js';
import { FindOrdersOptions } from '../types/orders.types.js';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private readonly ordersRepo: Repository<Order>) {}
  create(createOrderDto: Partial<Order>) {
    const order = this.ordersRepo.create(createOrderDto);
    return this.ordersRepo.save(order);
  }

  find(options?: FindOrdersOptions) {
    const { limit = 50, offset = 0 } = options;

    return this.ordersRepo.find({ take: limit, skip: offset });
  }

  findOne(id: string) {
    return this.ordersRepo.findOneBy({ id });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.ordersRepo.update(
      {
        id,
      },
      {
        ...updateOrderDto,
      },
    );
  }

  remove(id: string) {
    return this.ordersRepo.delete({ id });
  }

  findByMeliID(meliID: number) {
    return this.ordersRepo.findOne({
      where: {
        meliOrderIds: ArrayContains([meliID]),
      },
    });
  }
}
