import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity.js';
import { Question } from './question.entity.js';
import { QuickAnswer } from './quickanswer.entity';
import { UserConfig } from './user-config.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    onDelete: 'CASCADE'
  })
  quickAnswers?: QuickAnswer[];

  @OneToMany(() => Order, (order: Order) => order.user)
  orders: Order[]

  @OneToMany(() => Question, (question: Question) => question.user)
  questions: Question[]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
