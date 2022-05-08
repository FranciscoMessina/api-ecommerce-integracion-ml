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

export interface MeliItemSearchResponse {
  seller_id: string;
  query: string;
  paging: PagingOptions;
  results: string[];
  orders: any[];
  available_orders: any[];
}

export interface PagingOptions {
  limit: number;
  offset: number;
  total: number;
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

export interface HashedApiKey {
  content: string;
  iv: string;
}

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

export interface MeliItem {
  id: string;
  site_id: string;
  title: string;
  subtitle: null;
  seller_id: number;
  category_id: string;
  official_store_id: null;
  price: number;
  base_price: number;
  original_price: null;
  currency_id: string;
  initial_quantity: number;
  available_quantity: number;
  sold_quantity: number;
  sale_terms: Attribute[];
  buying_mode: string;
  listing_type_id: string;
  start_time: Date;
  stop_time: Date;
  condition: string;
  permalink: string;
  thumbnail_id: string;
  thumbnail: string;
  secure_thumbnail: string;
  pictures: Picture[];
  video_id: null;
  descriptions: any[];
  accepts_mercadopago: boolean;
  non_mercado_pago_payment_methods: any[];
  shipping: Shipping;
  international_delivery_mode: string;
  seller_address: SellerAddress;
  seller_contact: null;
  location: Location;
  coverage_areas: any[];
  attributes: Attribute[];
  warnings: any[];
  listing_source: string;
  variations: any[];
  status: string;
  sub_status: any[];
  tags: string[];
  warranty: string;
  catalog_product_id: null;
  domain_id: string;
  parent_item_id: null;
  differential_pricing: null;
  deal_ids: any[];
  automatic_relist: boolean;
  date_created: Date;
  last_updated: Date;
  health: number;
  catalog_listing: boolean;
  channels: string[];
}

export interface Attribute {
  id: string;
  name: string;
  value_id: null | string;
  value_name: string;
  value_struct: Struct | null;
  values: Value[];
  attribute_group_id?: string;
  attribute_group_name?: string;
}

export interface Struct {
  number: number;
  unit: string;
}

export interface Value {
  id: null | string;
  name: string;
  struct: Struct | null;
}

export interface Picture {
  id: string;
  url: string;
  secure_url: string;
  size: string;
  max_size: string;
  quality: string;
}

export interface SellerAddress {
  city: IdName;
  state: IdName;
  country: IdName;
  search_location: SearchLocation;
  id: number;
}

export interface IdName {
  id: string;
  name: string;
}

export interface SearchLocation {
  city: IdName;
  state: IdName;
}

export interface ItemShippingInfo {
  mode: string;
  methods: any[];
  tags: string[];
  dimensions: unknown;
  local_pick_up: boolean;
  free_shipping: boolean;
  logistic_type: string;
  store_pick_up: boolean;
}

export interface OrdersSearchResponse {
  query: string;
  results: MeliOrder[];
  sort: Sort;
  available_sorts: Sort[];
  filters: any[];
  paging: Paging;
  display: string;
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

export interface MeliOrder {
  payments: Payment[];
  fulfilled: boolean;
  taxes: Taxes;
  order_request: OrderRequest;
  expiration_date: Date;
  feedback: Feedback;
  shipping: Shipping;
  date_closed: Date;
  id: number;
  manufacturing_ending_date: null;
  order_items: OrderItem[];
  date_last_updated: Date;
  last_updated: Date;
  comment: null;
  pack_id: null;
  coupon: Coupon;
  shipping_cost: null;
  date_created: Date;
  pickup_id: null;
  status_detail: null;
  tags: Status[];
  buyer: Buyer;
  seller: Buyer;
  total_amount: number;
  paid_amount: number;
  currency_id: string;
  status: Status;
}

export interface Buyer {
  id: number;
  nickname: string;
}

export interface Coupon {
  amount: number;
  id: null;
}

export interface Feedback {
  buyer: null;
  seller: null;
}

export interface OrderItem {
  item: Item;
  quantity: number;
  unit_price: number;
  full_unit_price: number;
  currency_id: string;
  manufacturing_days: null;
  picked_quantity: null;
  requested_quantity: RequestedQuantity;
  sale_fee: number;
  listing_type_id: string;
  base_exchange_rate: null;
  base_currency_id: null;
  bundle: null;
  element_id: null;
}

export interface Item {
  id: string;
  title: string;
  category_id: string;
  variation_id: null;
  seller_custom_field: null;
  global_price: null;
  net_weight: null;
  variation_attributes: any[];
  warranty: string;
  condition: string;
  seller_sku: string;
}

export interface RequestedQuantity {
  measure: string;
  value: number;
}

export interface OrderRequest {
  change: null;
  return: null;
}

export interface Payment {
  reason: string;
  status_code: null;
  total_paid_amount: number;
  operation_type: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  date_approved: Date;
  collector: Shipping;
  coupon_id: null;
  installments: number;
  authorization_code: string;
  taxes_amount: number;
  id: number;
  date_last_modified: Date;
  coupon_amount: number;
  available_actions: string[];
  shipping_cost: number;
  installment_amount: number;
  date_created: Date;
  activation_uri: null;
  overpaid_amount: number;
  card_id: number | null;
  status_detail: string;
  issuer_id: string;
  payment_method_id: string;
  payment_type: string;
  deferred_period: null;
  atm_transfer_reference: {
    transaction_id: string;
    company_id: null;
  };
  site_id: string;
  payer_id: number;
  order_id: number;
  currency_id: string;
  status: string;
  transaction_order_id: null;
}

export interface Shipping {
  id: number | null;
}

export enum Status {
  NotDelivered = 'not_delivered',
  Paid = 'paid',
  TestOrder = 'test_order',
}

export interface Taxes {
  amount: unknown;
  currency_id: unknown;
  id: unknown;
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

export interface JwtPayload {
  userId: string;
}

export interface EnvVariables {
  ML_CLIENT_ID: string;
  ML_CLIENT_SECRET: string;
  MELI_API_BASE_URL: string;
  DATABASE_URL: string;
  HASH_KEY: string;
  NODE_ENV: string;
  GOOGLE_API_KEY: string;
  G_BOOKS_API_URL: string;
  EMAIL: string;
  EMAIL_PW: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  CORS_ORIGINS: string;
  MONGO_URI: string;
  PORT: number;
  DEV: boolean;
}
