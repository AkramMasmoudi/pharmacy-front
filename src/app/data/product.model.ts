import { User } from "./user.model";

export interface Product {
  id?: number|null;
  name: string;
  description: string;
  imageBase64?: string;
  quantity: number;
  price: number;
  sellerId?: number;
  buyerIds?: number[];
  buyers?: User[];

}
