import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  questionId: number;

  @Column()
  from: number;

  @ManyToOne(() => User, (user) => user.questions)
  user: User;

  @Column()
  status: string;
}
