export interface Product {
  id: number;
  vendorId: string;
  vendorName?: string;
  vendorRating?: number;
  totalReviews?: number;
  name: string;
  category: string;
  grade?: string; // Grade A, B, or C
  description: string;
  unit: string;
  currentPrice: number;
  availableQuantity: number;
  minOrderQty?: number; // Minimum order quantity
  imageUrl?: string;
  emoji?: string;
  isActive: boolean;
  priceTiers?: Array<{minQty: number, maxQty: number, price: number}>; // Tiered pricing
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  grade: string; // Required grade field
  description: string;
  unit: string;
  price: number;
  quantity: number;
  minOrderQty: number; // Minimum order quantity
  imageUrl?: string;
  emoji?: string;
  priceTiers?: Array<{minQty: number, maxQty: number, price: number}>; // Optional tiered pricing
}

export interface QuickPriceUpdateRequest {
  productId: number;
  newPrice: number;
}
