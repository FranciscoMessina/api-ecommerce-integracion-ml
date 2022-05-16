import { Allow } from 'class-validator';
import { QuestionStatus } from '../../types/questions.types.js';

export class QuestionsFiltersDto {
  @Allow()
  from?: number;

  @Allow()
  item?: string;

  @Allow()
  questionId?: number;

  @Allow()
  status?: QuestionStatus;

  @Allow()
  sort?: string;

  @Allow()
  limit?: number;

  @Allow()
  offset?: number;

  @Allow()
  history: boolean;
}
