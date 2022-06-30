
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Book {
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   title: string;

   @Column()
   price: number;

   @Column({ type: 'char', array: true })
   author: string[]

   @Column({ unique: true, nullable: false })
   SKU: string;

   // TODO: add category & subCategory table and relations | maybe just leave category data in book
   @Column()
   category: string;

   @Column()
   subCategory: string

   // TODO: create table and relations to make easier searching by language.
   @Column()
   language: string;

   @Column()
   condition: 'new' | 'used' | 'second' | 'sale'

   @Column()
   isbn?: string;

   @Column()
   cover: 'hardback' | 'paperback'

   @Column()
   stock: number;

   @Column({ nullable: false, default: 0 })
   sold_quantity: number;

   // TODO: Table and relations
   @Column()
   publisher: string;

   @Column()
   images: string[]

   @Column()
   free_shipping: boolean;

   // TODO: Table and relations
   @Column()
   provider: string

}