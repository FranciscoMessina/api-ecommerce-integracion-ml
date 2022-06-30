import { Allow } from 'class-validator';

export class MeliOauthQueryDto {
   @Allow()
   code: string;

   @Allow()
   state?: number;

   @Allow()
   error?: string;
}
