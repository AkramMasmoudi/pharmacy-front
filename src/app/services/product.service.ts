import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../data/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly baseUrl = 'http://localhost:8080/api/products';
  private readonly baseUrlUsers = 'http://localhost:8080/api/users';

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getProductsByUserId(userId : number | null | undefined): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/${userId}`);
  }

  updateProductQuantity(productId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${productId}/quantity`, { quantity });
  }

  addProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, formData);
  }

  updateProduct(product: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${product.id}`, product);
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`);
  }


}
