import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Product, CreateProductRequest, QuickPriceUpdateRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getProducts(category?: string): Observable<Product[]> {
    const url = category
      ? `${environment.marketplaceApiUrl}/products?category=${category}`
      : `${environment.marketplaceApiUrl}/products`;
    return this.http.get<Product[]>(url);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.marketplaceApiUrl}/products/${id}`);
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.marketplaceApiUrl}/products/my-products`);
  }

  getVendorInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.orderingApiUrl}/products/vendor-inventory`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${environment.marketplaceApiUrl}/products`, request);
  }

  updatePrice(request: QuickPriceUpdateRequest): Observable<any> {
    return this.http.post(`${environment.marketplaceApiUrl}/products/quick-price-update`, request);
  }

  getPriceHistory(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.marketplaceApiUrl}/products/${productId}/price-history`);
  }
}
