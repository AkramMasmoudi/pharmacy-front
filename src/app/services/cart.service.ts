import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cart } from '../data/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private baseUrl = 'http://localhost:8080/api/carts';

  constructor(private http: HttpClient) {}

  addProductToCart(cart: Cart): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/add`, cart);
  }

  removeProductFromCart(buyerId: number, productId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${buyerId}/remove/${productId}`);
  }

  modifyProductQuantity(buyerId: number, productId: number, quantityChange: number): Observable<string> {
    return this.http.patch<string>(
      `${this.baseUrl}/${buyerId}/increase/${productId}`,
      null,
      { params: { quantityChange: quantityChange.toString() } }
    );
  }

  clearCart(buyerId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${buyerId}/clear`);
  }

  getCartByBuyerId(buyerId: number): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.baseUrl}/${buyerId}`);
  }

  validateCart(carts: Cart[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/validate`, carts);
  }
}
