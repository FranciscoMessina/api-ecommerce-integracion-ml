import { IsString } from 'class-validator';

export class HelloDto {
  @IsString()
  hello: string;
}
