import { Column, Entity, Generated, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('quick_answers')
export class QuickAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  text: string;

  @Column()
  color: string;

  @Column()
  @Generated('increment')
  position: number;

  @ManyToOne(() => User, (user) => user.quickAnswers)
  user: User;
}
