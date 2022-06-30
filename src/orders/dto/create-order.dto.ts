import { Allow, IsBoolean, IsDateString, IsString } from 'class-validator';
import { InvoiceStatus, SearchStatus, SaleChannel } from '../../types/orders.types.js';

export class CreateOrderDto {
   @Allow()
   cartId?: number;

   @Allow()
   meliOrderIds?: number[];

   @Allow()
   invoiceStatus?: InvoiceStatus;

   @Allow()
   invoiceId?: string;

   @Allow()
   searchStatus?: SearchStatus;

   @Allow()
   saleChannel: SaleChannel;

   @Allow()
   products: { id?: string; title: string; price: number; quantity: number; }[]

   @IsString()
   client: string;

   @IsDateString()
   date: Date

   @IsBoolean()
   emitInvoice: boolean
}
