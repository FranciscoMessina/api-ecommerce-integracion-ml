import { IsNumber, IsString, Length } from 'class-validator';

export class AnswerQuestionDto {
  @Length(1, 2000)
  @IsString()
  answer: string;

  @IsNumber()
  id: number;
}
