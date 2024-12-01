import { Product } from "./product.model";

export interface User {
  id?: number|null;
  username: string;
  userSecondName?: string|null;
  tel?: string|null;
  adress?: string|null;
  role: number;
  productIds?: number[]|null;
  products?: Product[]|null;
  cart?: Product[]|null;
  password: string;
  confirmPassword?: string|null;
}
