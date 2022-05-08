import { User } from 'src/entities/user.entity';

declare module 'express' {
  interface Request {
    user?: User;
  }
}
