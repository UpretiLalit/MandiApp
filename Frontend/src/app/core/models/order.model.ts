export interface Order {
  id: number;
  buyerId: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress?: string;
  transporterId?: string;
  createdAt: string;
  completedAt?: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  vendorId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: number;
  buyerId: string;
  cartItems: CartItem[];
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  productName: string;
  vendorId: string;
  vendorName?: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
  grade?: string;
}

export enum OrderStatus {
  Pending = 'Pending',
  PaymentReceived = 'PaymentReceived',
  Processing = 'Processing',
  ReadyForDispatch = 'ReadyForDispatch',
  InTransit = 'InTransit',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}
