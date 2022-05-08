import { IsString } from 'class-validator';

export class QuickAnswerDto {
  @IsString({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Text required' })
  text: string;

  @IsString({ message: 'Color is required' })
  color: string;
}
