import { Allow, IsBoolean, IsNumber, IsString, Length } from "class-validator";

export class CreateQuickItemDTO {
   @IsString()
   @Length(10, 60)
   title: string

   @IsNumber()
   price: number

   @IsBoolean()
   free_shipping: boolean;

   @Allow()
   channels: string[]

   @IsString()
   category: string

   @IsString()
   subCategory: string

   @IsString()
   condition: string
}