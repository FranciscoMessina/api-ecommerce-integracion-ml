import { Column, Entity, Generated, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class QuickAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  text: string;

  @Column()
  color: string;

  @Generated('increment')
  position: number;

  @ManyToOne(() => User, (user) => user.quickAnswers)
  user: User;
}
