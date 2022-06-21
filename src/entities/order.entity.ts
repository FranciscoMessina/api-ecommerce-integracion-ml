import { MeliBuyer, InvoiceStatus, SaleChannel, SearchStatus } from 'src/types/orders.types';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  cartId?: number;

  @Column('bigint', {
    array: true,
    nullable: true,
    transformer: {
      from: (value: string[] | null) => {
        if (!value) return value;

        return value.map((a) => parseInt(a, 10));
      },
      to: (value) => value,
    },
  })
  meliOrderIds?: number[];

  @Column('jsonb')
  buyer: Partial<MeliBuyer>;

  @Column('jsonb')
  items: {
    id: string;
    quantity: number;
    price: number;
  }[];

  @Column({ nullable: true, type: 'bigint', transformer: {
   from(value) {
      if(!value) return value;

      return parseInt(value, 10)
   },
   to: (value) => value
  } })
  shippingId: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.Pending })
  invoiceStatus: InvoiceStatus;

  @Column({ nullable: true })
  invoiceId?: string;

  @Column({ type: 'enum', enum: SearchStatus, default: SearchStatus.Pending })
  searchStatus: SearchStatus;

  @Column({ type: 'enum', enum: SaleChannel, nullable: false })
  saleChannel: SaleChannel;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
