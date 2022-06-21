import { Paging } from './meli.types.js';

export interface MeliItem {
  id: string;
  site_id: string;
  title: string;
  subtitle: null;
  seller_id: number;
  category_id: string;
  official_store_id?: string | number;
  price: number;
  base_price: number;
  original_price?: number;
  inventory_id?: string | number;
  currency_id: string;
  initial_quantity: number;
  available_quantity: number;
  sold_quantity: number;
  sale_terms: SaleTerm[];
  buying_mode: string;
  listing_type_id: string;
  start_time: Date;
  stop_time: Date;
  end_time: Date;
  expiration_time: Date;
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
  seller_contact?: any;
  location: any;
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
  seller_custom_field: null;
  parent_item_id?: string;
  differential_pricing?: any;
  deal_ids: any[];
  automatic_relist: boolean;
  date_created: Date;
  last_updated: Date;
  health: number;
  catalog_listing: boolean;
  item_relations: any[];
  channels: string[];
}

export enum ItemAttributesEnum {
  id = 'id',
  site_id = 'site_id',
  title = 'title',
  subtitle = 'subtitle',
  seller_id = 'seller_id',
  category_id = 'category_id',
  official_store_id = 'official_store_id',
  price = 'price',
  base_price = 'base_price',
  original_price = 'original_price',
  currency_id = 'currency_id',
  initial_quantity = 'initial_quantity',
  available_quantity = 'available_quantity',
  sold_quantity = 'sold_quantity',
  sale_terms = 'sale_terms',
  buying_mode = 'buying_mode',
  listing_type_id = 'listing_type_id',
  start_time = 'start_time',
  stop_time = 'stop_time',
  end_time = 'end_time',
  condition = 'condition',
  permalink = 'permalink',
  thumbnail_id = 'thumbnail_id',
  thumbnail = 'thumbnail',
  secure_thumbnail = 'secure_thumbnail',
  pictures = 'pictures',
  video_id = 'video_id',
  accepts_mercadopago = 'accepts_mercadopago',
  shipping = 'shipping',
  seller_address = 'seller_address',
  seller_contact = 'seller_contact',
  location = 'location',
  coverage_areas = 'coverage_areas',
  attributes = 'attributes',
  warnings = 'warnings',
  status = 'status',
  sub_status = 'sub_status',
  tags = 'tags',
  warranty = 'warranty',
  catalog_product_id = 'catalog_product_id',
  domain_id = 'domain_id',
  date_created = 'date_created',
  last_updated = 'last_updated',
  health = 'health',
  catalog_listing = 'catalog_listing',
  channels = 'channels',
}

export type ItemAttributes = keyof typeof ItemAttributesEnum;

export interface SellerAddress {
  city?: {
    id: string;
    name: string;
  };
  state?: {
    id: string;
    name: string;
  };
  country?: {
    id: string;
    name: string;
  };
  search_location?: {
    city?: {
      id: string;
      name: string;
    };
    state?: {
      id: string;
      name: string;
    };
  };
  id?: number;
}

export interface Value {
  id?: string;
  name: string;
  struct?: Struct | null;
  metadata?: {
    value?: boolean;
  };
}

export interface Struct {
  number: number;
  unit: string;
}

export interface Picture {
  id: string;
  url: string;
  secure_url: string;
  size: string;
  max_size: string;
  quality: string;
}

export interface SaleTerm {
  id: string;
  name: string;
  value_id: null | string;
  value_name: string;
  value_struct: Struct | null;
  values: Value[];
}

export interface Shipping {
  mode: string;
  methods: any[];
  free_methods: {
    id: number;
    rule: {
      default: boolean;
      free_mode: string;
      free_shipping_flag: boolean;
      value: null;
    };
  }[];

  tags: string[];
  dimensions?: any;
  local_pick_up: boolean;
  free_shipping: boolean;
  logistic_type: string;
  store_pick_up: boolean;
}

export interface MeliItemSearchResponse {
  seller_id: string;
  query?: string;
  paging: Paging;
  results: string[];
  orders: {
    id: string;
    name: string;
  }[];
  available_orders: {
    id: string;
    name: string;
  }[];
}

export interface GetItemsByIdsResponse {
  code: number;
  body: Partial<MeliItem>;
}

export interface Attribute {
  id: string;
  name: string;
  tags?: {
    [key: string]: any;
    hidden?: boolean;
    multivalued?: boolean;
    required?: boolean;
    variation_attribute?: boolean;
    read_only?: boolean;
    catalog_required?: boolean;
  };
  hierarchy?: string;
  relevance?: number;
  value_type?: string;
  value_max_length?: number;
  values?: Value[];
  attribute_group_id?: string;
  attribute_group_name?: string;
  allowed_units?: Value[];
  default_unit?: string;
  tooltip?: string;
  example?: string;
  hint?: string;
}
