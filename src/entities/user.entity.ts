import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity.js';
import { QuickAnswer } from './quickanswer.entity';
import { UserConfig } from './user-config.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column('text', { array: true, nullable: true })
  @Exclude()
  refreshToken?: string[];

  @OneToOne(() => UserConfig, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  config: UserConfig;

  @OneToMany(() => QuickAnswer, (qa: QuickAnswer) => qa.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  quickAnswers?: QuickAnswer[];

  @OneToMany(() => Order, (order: Order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
