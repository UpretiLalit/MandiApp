export interface Product {
  id: number;
  vendorId: string;
  vendorName?: string;
  vendorRating?: number;
  totalReviews?: number;
  name: string;
  category: string;
  description: string;
  unit: string;
  currentPrice: number;
  availableQuantity: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  description: string;
  unit: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface QuickPriceUpdateRequest {
  productId: number;
  newPrice: number;
}
