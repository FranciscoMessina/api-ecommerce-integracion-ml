import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoiceId: string;

  @Column({ type: 'jsonb', nullable: false })
  products: {
    id: string;
    title: string;
    price: number;
    quantity: number;
  }[];
}
