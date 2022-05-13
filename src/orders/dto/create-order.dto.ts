import { Allow, IsOptional, IsString } from 'class-validator';
import { InvoiceStatus, SearchStatus, SaleChannel } from '../../types/orders.types.js';

export class CreateOrderDto {
  @IsOptional()
  cartId?: number;

  @IsString({ each: true })
  @IsOptional()
  meliOrderIds?: number[];

  @Allow()
  invoiceStatus?: InvoiceStatus;

  @Allow()
  invoiceId?: string;

  @Allow()
  searchStatus?: SearchStatus;

  @Allow()
  saleChannel: SaleChannel;
}
