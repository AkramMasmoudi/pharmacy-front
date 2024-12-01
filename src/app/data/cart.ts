import { Product } from './product.model';

export interface Cart {
  id?: number|null;
  buyerId: number;
  productId: number;
  product ?: Product;
  quantity: number;
}
