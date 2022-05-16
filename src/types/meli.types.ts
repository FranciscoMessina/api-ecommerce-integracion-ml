import { User } from 'src/entities/user.entity';

export interface MeliApiError {
  message: string;
  error: string;
  status: number;
  cause: string[];
}

export interface MeliOauthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

export interface MeliNotificationEvent {
  notification: MeliNotification;
  user: User;
}

export enum MeliNotificationTopic {
  ORDERS = 'orders_v2',
  ITEMS = 'items',
  QUESTIONS = 'questions',
  PAYMENTS = 'payments',
  MESSAGES = 'messages',
  SHIPPMENTS = 'shipments',
  INVOICES = 'invoices',
  CLAIMS = 'claims',
}

export interface MeliNotification {
  resource: string;
  user_id: number;
  topic: MeliNotificationTopic;
  application_id: number;
  attempts: number;
  sent: Date;
  received: Date;
}

export interface MeliSendMessageOptions {
  message: string;
  msgGroupId: number;
  buyerId: number;
}

export interface AvailableFilter {
  id: string;
  name: string;
  type: string;
  values?: string[];
}

export interface Filters {
  limit: number;
  offset: number;
  api_version: string;
  is_admin: boolean;
  sorts: any[];
  caller: number;
  item: string;
}

export interface Sort {
  id: string;
  name: string;
}

export interface Paging {
  total: number;
  offset: number;
  limit: number;
}

export interface MeliMessage {
  id: string;
  site_id: string;
  client_id: unknown;
  from: {
    user_id: number;
  };
  to: {
    user_id: number;
  };
  status: string;
  subject: unknown;
  text: string;
  message_date: MessageDate;
  message_moderation: MessageModeration;
  message_attachments: unknown;
  message_resources: MessageResource[];
  conversation_first_message: boolean;
}

export interface MessageDate {
  received: Date;
  available: Date;
  notified: Date;
  created: Date;
  read: unknown;
}

export interface MessageModeration {
  status: string;
  reason: string;
  source: string;
  moderation_date: Date;
}

export interface MessageResource {
  id: string;
  name: string;
}
