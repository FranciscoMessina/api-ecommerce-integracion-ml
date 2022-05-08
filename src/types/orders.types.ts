export enum InvoiceStatus {
  Pending = 'pending',
  Emitted = 'emitted',
  Canceled = 'canceled',
}

export enum SearchStatus {
  Pending = 'pending',
  NotFound = 'not_found',
  Found = 'found',
}

export enum SaleChannel {
  ML = 'mercadolibre',
  MS = 'mercadoshops',
  LOCAL = 'local',
  SHOP = 'shop',
}
