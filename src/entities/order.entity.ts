import { InvoiceStatus, SaleChannel, SearchStatus } from 'src/types/orders.types';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isCartOrder: boolean;

  @Column('bigint', {
    array: true,
    nullable: true,
    transformer: {
      from: (value: string | null) => {
        if (!value) return value;

        return parseInt(value);
      },
      to: (value) => value,
    },
  })
  meliOrderIds?: number[];

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.Pending })
  invoiceStatus: InvoiceStatus;

  @Column({ unique: true })
  invoiceId: string;

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
