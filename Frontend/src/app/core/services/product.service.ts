import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Product, CreateProductRequest, QuickPriceUpdateRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsCache$?: Observable<Product[]>;
  private cacheTime: number = 0;
  private CACHE_DURATION = 30000; // 30 seconds cache

  constructor(private http: HttpClient) {}

  getProducts(category?: string, forceRefresh: boolean = false): Observable<Product[]> {
    const now = Date.now();
    
    // Return cached data if still valid and no category filter
    if (!forceRefresh && !category && this.productsCache$ && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.productsCache$;
    }

    const url = category
      ? `${environment.marketplaceApiUrl}/products?category=${category}`
      : `${environment.marketplaceApiUrl}/products`;
    
    const request$ = this.http.get<Product[]>(url).pipe(
      tap(() => {
        if (!category) {
          this.cacheTime = now;
        }
      }),
      shareReplay(1) // Share the result with multiple subscribers
    );

    // Cache only non-filtered requests
    if (!category) {
      this.productsCache$ = request$;
    }

    return request$;
  }

  clearCache(): void {
    this.productsCache$ = undefined;
    this.cacheTime = 0;
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.marketplaceApiUrl}/products/${id}`);
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.marketplaceApiUrl}/products/my-products`);
  }

  getVendorInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.marketplaceApiUrl}/products/vendor-inventory`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    this.clearCache(); // Clear cache when creating new product
    return this.http.post<Product>(`${environment.marketplaceApiUrl}/products`, request);
  }

  updatePrice(request: QuickPriceUpdateRequest): Observable<any> {
    this.clearCache(); // Clear cache when updating price
    return this.http.post(`${environment.marketplaceApiUrl}/products/quick-price-update`, request);
  }

  getPriceHistory(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.marketplaceApiUrl}/products/${productId}/price-history`);
  }
}
