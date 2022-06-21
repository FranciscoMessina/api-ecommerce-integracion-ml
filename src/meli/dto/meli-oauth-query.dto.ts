import { IsOptional } from 'class-validator';

export class MeliOauthQueryDto {
  @IsOptional()
  code: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  error?: string;
}
