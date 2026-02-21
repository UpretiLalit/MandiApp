import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface MasterProduct {
  id: string;
  name: string;
  nameHindi?: string;
  category: string;
  subCategory?: string;
  description?: string;
  unit: string;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToInventoryRequest {
  masterProductId: string;
  currentPrice: number;
  availableQuantity: number;
  minOrderQty: number;
  grade?: string;
  priceTiers?: Array<{ minQty: number; pricePerUnit: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class MasterProductService {
  constructor(private http: HttpClient) {}

  getAllMasterProducts(category?: string, search?: string): Observable<MasterProduct[]> {
    let url = `${environment.marketplaceApiUrl}/masterproducts`;
    const params: string[] = [];
    
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<MasterProduct[]>(url);
  }

  getMasterProductsByCategory(category: string): Observable<MasterProduct[]> {
    return this.http.get<MasterProduct[]>(
      `${environment.marketplaceApiUrl}/masterproducts/category/${category}`
    );
  }

  getMasterProduct(id: string): Observable<MasterProduct> {
    return this.http.get<MasterProduct>(
      `${environment.marketplaceApiUrl}/masterproducts/${id}`
    );
  }

  getCategories(): Observable<any> {
    return this.http.get(`${environment.marketplaceApiUrl}/masterproducts/categories`);
  }

  addToInventory(request: AddToInventoryRequest): Observable<any> {
    return this.http.post(
      `${environment.marketplaceApiUrl}/masterproducts/add-to-inventory`,
      request
    );
  }

  toggleLiveStatus(productId: number): Observable<any> {
    return this.http.patch(
      `${environment.marketplaceApiUrl}/masterproducts/${productId}/toggle-live`,
      {}
    );
  }
}
