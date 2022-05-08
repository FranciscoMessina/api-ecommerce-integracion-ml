import { IsString } from 'class-validator';

export class SignatureDto {
  @IsString()
  signature: string;
}
