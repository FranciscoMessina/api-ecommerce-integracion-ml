import { IsBoolean, IsString } from 'class-validator';

export class AutoMessageDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  message: string;
}
