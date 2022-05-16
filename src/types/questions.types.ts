import { AvailableFilter, Filters } from './meli.types.js';

export interface UnansweredQuestion {
  id: number;
  answer: null;
  date_created: Date;
  item_id: string;
  seller_id: number;
  status: string;
  text: string;
  from: From;
}

export type QuestionStatus = 'UNANSWERED' | 'ANSWERED' | 'CLOSED_UNANSWERED' | 'UNDER_REVIEW';

export interface GetQuestionsFilters {
  item?: string;
  status?: QuestionStatus;
  from?: number;
  questionId?: number;
  sort?: {
    fields: string;
    order: 'ASC' | 'DESC';
  };
  limit?: number;
  offset?: number;
}

export interface QuestionsResponseTime {
  user_id: number;
  total: {
    response_time: number;
  };
  weekend: {
    response_time: number;
    sales_percent_increse: number | null;
  };
  weekend_working_hours: {
    response_time: number;
    sales_percent_increse: number | null;
  };
  weekend_extra_hours: {
    response_time: number;
    sales_percent_increse: number | null;
  };
}

export interface Answer {
  date_created: Date;
  status: string;
  text: string;
}

export interface From {
  id: number;
  answered_questions?: number;
}

export interface QuestionsByItemID {
  total: number;
  limit: number;
  questions: any[];
  filters: Filters;
  available_filters: AvailableFilter[];
  available_sorts: string[];
}

export interface AnsweredQuestion {
  id: number;
  answer: Answer;
  date_created: Date;
  deleted_from_listing: boolean;
  hold: boolean;
  item_id: string;
  seller_id: number;
  status: string;
  text: string;
  from: From;
}
