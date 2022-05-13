export enum InvoiceStatus {
  Pending = 'pending',
  Emitted = 'emitted',
  Canceled = 'canceled',
}

export enum SearchStatus {
  Pending = 'pending',
  NotFound = 'not_found',
  Found = 'found',
  Delivered = 'delivered',
}

export enum SaleChannel {
  ML = 'mercadolibre',
  MS = 'mercadoshops',
  LOCAL = 'local',
  SHOP = 'shop',
}

export interface FindOrdersOptions {
  limit?: number;
  offset?: number;
}

export interface MeliBuyer {
  id: number | string;
  nickname?: string;
  first_name?: string;
  last_name?: string;
}

export interface MeliPayment {
  reason: string;
  status_code: null;
  total_paid_amount: number;
  operation_type: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  date_approved: Date;
  collector: {
    id: number;
  };
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

export interface MeliOrderItem {
  item: {
    id: string;
    title: string;
    category_id: string;
    variation_id?: string;
    seller_custom_field?: string;
    variation_attributes?: string[];
    warranty: string;
    condition: string;
    seller_sku?: string;
    global_price?: number;
    net_weight?: string;
  };
  quantity: number;
  requested_quantity: {
    value: 1;
    measure: string;
  };
  picked_quantity?: number;
  unit_price: number;
  full_unit_price: number;
  currency_id: string;
  manufacturing_days?: number;
  sale_fee: number;
  listing_type_id: string;
}

export interface MeliOrder {
  id: number;
  date_created: Date;
  date_closed: Date;
  last_updated: Date;
  manufacturing_ending_date?: Date;
  comment?: string;
  pack_id?: number;
  pickup_id?: number;
  order_request?: {
    return?: any;
    change?: any;
  };
  fulfilled?: any;
  mediations: any[];
  total_amount: number;
  paid_amount: number;
  coupon: {
    id?: number;
    amount: number;
  };
  expiration_date: Date;
  order_items: MeliOrderItem[];
  currency_id: string;
  payments: MeliPayment[];
  shipping: {
    id?: number;
  };
  status: string;
  status_detail?: string;
  tags: string[];
  feedback: {
    buyer?: any;
    seller?: any;
  };
  context: {
    channel: string;
    site: string;
    flows: any[];
  };
  buyer: MeliBuyer;
  seller: {
    id: number;
    nickname: string;
    first_name: string;
    last_name: string;
    phone: {
      extension: string;
      area_code: string;
      number: string;
      verified: boolean;
    };
    alternative_phone: {
      extension: string;
      area_code: string;
      number: string;
      verified: boolean;
    };
  };
  taxes: {
    amount?: number | string;
    currency_id?: string;
    id?: number | string;
  };
}
