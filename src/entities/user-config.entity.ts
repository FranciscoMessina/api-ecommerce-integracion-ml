import { Exclude } from 'class-transformer';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user-configs')
export class UserConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  hello?: string;

  @Column({ nullable: true })
  signature?: string;

  @Column({ nullable: true })
  @Exclude()
  meliAccess?: string;

  @Column({ nullable: true })
  @Exclude()
  meliRefresh?: string;

  @Column({ nullable: true })
  meliId?: number;

  @Column({
    nullable: true,
    type: 'bigint',
    transformer: {
      from: (value: string | null) => {
        if (!value) return value;

        return parseInt(value);
      },
      to: (value) => value,
    },
    default: null,
  })
  @Exclude()
  meliTokenExpires?: number;

  @Column('jsonb', {
    default: {
      enabled: false,
      message: 'Test message',
    },
  })
  autoMessage: { enabled: boolean; message: string };

  @OneToOne(() => User, (user: User) => user.config)
  user: User;
}
