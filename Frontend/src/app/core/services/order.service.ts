import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Cart, CartItem, Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${environment.orderingApiUrl}/cart`);
  }

  addToCart(item: any): Observable<CartItem> {
    return this.http.post<CartItem>(`${environment.orderingApiUrl}/cart/add`, item);
  }

  updateCartItem(cartItemId: number, quantity: number): Observable<any> {
    return this.http.put(`${environment.orderingApiUrl}/cart/update/${cartItemId}?quantity=${quantity}`, {});
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete(`${environment.orderingApiUrl}/cart/remove/${cartItemId}`);
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${environment.orderingApiUrl}/cart/clear`);
  }

  createOrder(orderRequest: any): Observable<Order> {
    return this.http.post<Order>(`${environment.orderingApiUrl}/orders`, orderRequest);
  }

  // Unified cart checkout with order splitting
  checkout(orderRequest: any): Observable<any> {
    return this.http.post<any>(`${environment.orderingApiUrl}/orders/checkout`, orderRequest);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.orderingApiUrl}/orders/my-orders`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.orderingApiUrl}/orders/${id}`);
  }

  initiatePayment(orderId: number): Observable<any> {
    return this.http.post(`${environment.orderingApiUrl}/orders/${orderId}/initiate-payment`, {});
  }

  capturePayment(transactionId: string): Observable<any> {
    return this.http.post(`${environment.orderingApiUrl}/orders/capture-payment/${transactionId}`, {});
  }

  // Create Razorpay payment order
  createPaymentOrder(orderRequest: any): Observable<any> {
    return this.http.post<any>(`${environment.orderingApiUrl}/orders/create-payment-order`, orderRequest);
  }

  // Complete payment and create parent/child orders
  completePaymentOrder(paymentData: any): Observable<any> {
    return this.http.post<any>(`${environment.orderingApiUrl}/orders/complete-payment`, paymentData);
  }
}
