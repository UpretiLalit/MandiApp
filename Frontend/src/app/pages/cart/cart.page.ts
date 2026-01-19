import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { OrderService } from '@core/services/order.service';
import { Cart, CartItem } from '@core/models/order.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  cart: Cart | null = null;
  vendorGroups: Map<string, CartItem[]> = new Map();
  
  // Phase 1: Cost Breakdown
  produceTotal: number = 0;
  logisticsFee: number = 0;
  serviceFee: number = 0;
  totalLandingCost: number = 0;
  
  deliveryAddress: string = '';
  totalVendors: number = 0;
  totalItems: number = 0;
  totalWeight: number = 0;
  
  // Fee Calculation Constants
  readonly LOGISTICS_FEE_PER_KG = 2; // ₹2 per kg (single transporter "Mandi Run")
  readonly SERVICE_FEE_PERCENTAGE = 0.03; // 3% platform fee
  readonly MIN_LOGISTICS_FEE = 50; // Minimum logistics fee

  constructor(
    private orderService: OrderService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  ionViewWillEnter() {
    this.loadCart();
  }

  async loadCart() {
    const loading = await this.loadingController.create({
      message: 'Loading cart...'
    });
    await loading.present();

    this.orderService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.groupByVendor();
        this.calculateTotal();
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        loading.dismiss();
        this.showToast('Failed to load cart', 'danger');
      }
    });
  }

  groupByVendor() {
    this.vendorGroups.clear();
    if (this.cart?.cartItems) {
      this.cart.cartItems.forEach(item => {
        const vendorKey = `${item.vendorId}-${item.vendorName || 'Unknown Vendor'}`;
        if (!this.vendorGroups.has(vendorKey)) {
          this.vendorGroups.set(vendorKey, []);
        }
        this.vendorGroups.get(vendorKey)?.push(item);
      });
    }
    this.totalVendors = this.vendorGroups.size;
  }

  calculateTotal() {
    // Reset counters
    this.produceTotal = 0;
    this.totalWeight = 0;
    this.totalItems = 0;
    
    if (this.cart?.cartItems) {
      this.cart.cartItems.forEach(item => {
        const itemTotal = item.quantity * item.unitPrice;
        this.produceTotal += itemTotal;
        this.totalWeight += item.quantity; // Assuming quantity is in kg
        this.totalItems += item.quantity;
      });
    }
    
    // Calculate logistics fee (₹2 per kg, minimum ₹50)
    // Single transporter does "Mandi Run" to collect from all vendors
    const calculatedLogistics = Math.round(this.totalWeight * this.LOGISTICS_FEE_PER_KG);
    this.logisticsFee = Math.max(calculatedLogistics, this.MIN_LOGISTICS_FEE);
    
    // Calculate service fee (3% of produce total)
    this.serviceFee = Math.round(this.produceTotal * this.SERVICE_FEE_PERCENTAGE);
    
    // Calculate Total Landing Cost (Single Payment)
    this.totalLandingCost = this.produceTotal + this.logisticsFee + this.serviceFee;
  }

  get totalAmount(): number {
    return this.totalLandingCost;
  }

  async updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    this.orderService.updateCartItem(item.id, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.calculateTotal();
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.showToast('Failed to update quantity', 'danger');
      }
    });
  }

  async removeItem(item: CartItem) {
    const alert = await this.alertController.create({
      header: 'Remove Item',
      message: `Remove ${item.productName} from cart?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.orderService.removeFromCart(item.id).subscribe({
              next: () => {
                this.showToast('Item removed', 'success');
                this.loadCart();
              },
              error: (error) => {
                console.error('Error removing item:', error);
                this.showToast('Failed to remove item', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async checkout() {
    if (!this.deliveryAddress || this.deliveryAddress.trim() === '') {
      this.showToast('Please enter delivery address', 'warning');
      return;
    }

    // Initiate UPI Payment via Razorpay
    await this.initiatePayment();
  }

  async initiatePayment() {
    const loading = await this.loadingController.create({
      message: 'Initiating payment...'
    });
    await loading.present();

    try {
      // Create order request for backend
      const orderRequest = {
        items: this.cart!.cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          vendorId: item.vendorId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        deliveryAddress: this.deliveryAddress,
        produceTotal: this.produceTotal,
        logisticsFee: this.logisticsFee,
        serviceFee: this.serviceFee,
        totalLandingCost: this.totalLandingCost,
        paymentMethod: 'UPI',
        isEscrow: false
      };

      // Get payment order from backend (Razorpay order creation)
      this.orderService.createPaymentOrder(orderRequest).subscribe({
        next: (paymentOrder: any) => {
          loading.dismiss();
          this.openRazorpayPayment(paymentOrder, orderRequest);
        },
        error: (error) => {
          loading.dismiss();
          console.error('Payment initiation failed:', error);
          this.showToast('Payment initiation failed', 'danger');
        }
      });
    } catch (error) {
      loading.dismiss();
      console.error('Error:', error);
      this.showToast('An error occurred', 'danger');
    }
  }

  openRazorpayPayment(paymentOrder: any, orderRequest: any) {
    const options = {
      key: 'rzp_test_YOUR_KEY_ID', // Replace with your Razorpay key
      amount: Math.round(this.totalLandingCost * 100), // Amount in paise
      currency: 'INR',
      name: 'Mandi App',
      description: `Payment for ${this.totalItems} items from ${this.totalVendors} vendors`,
      order_id: paymentOrder.razorpayOrderId,
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#28a745'
      },
      handler: (response: any) => {
        // Payment successful callback
        this.handlePaymentSuccess(response, orderRequest);
      },
      modal: {
        ondismiss: () => {
          this.showToast('Payment cancelled', 'warning');
        }
      }
    };

    // Check if Razorpay is loaded
    if (typeof (window as any).Razorpay !== 'undefined') {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      this.showToast('Payment gateway not loaded. Please refresh.', 'danger');
    }
  }

  async handlePaymentSuccess(paymentResponse: any, orderRequest: any) {
    const loading = await this.loadingController.create({
      message: 'Processing order...'
    });
    await loading.present();

    // Send payment success to backend to create parent and child orders
    const completeOrderRequest = {
      ...orderRequest,
      paymentId: paymentResponse.razorpay_payment_id,
      razorpayOrderId: paymentResponse.razorpay_order_id,
      razorpaySignature: paymentResponse.razorpay_signature,
      paymentStatus: 'Success'
    };

    this.orderService.completePaymentOrder(completeOrderRequest).subscribe({
      next: async (response: any) => {
        loading.dismiss();
        
        // Show success with parent/child order details
        const successAlert = await this.alertController.create({
          header: '✓ Payment Successful',
          cssClass: 'payment-success-alert',
          message: `
            <div style="text-align: center; padding: 16px;">
              <ion-icon name="checkmark-circle" color="success" style="font-size: 72px; margin-bottom: 16px;"></ion-icon>
              <h2 style="margin: 0 0 8px; color: #28a745;">₹${this.totalLandingCost} Paid</h2>
              <p style="color: #666; margin: 0 0 24px;">Transaction ID: ${paymentResponse.razorpay_payment_id.substring(0, 16)}...</p>
            </div>
            
            <div style="text-align: left; background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <strong style="display: block; margin-bottom: 8px;">📦 Order Split Complete</strong>
              <p style="margin: 4px 0; font-size: 14px;">
                <strong>Parent Order:</strong> ${response.parentOrder.orderNumber}<br>
                <strong>Status:</strong> <span style="color: #28a745;">Paid</span><br>
                <strong>Amount:</strong> ₹${response.parentOrder.totalAmount}
              </p>
            </div>
            
            <div style="text-align: left; background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <strong style="display: block; margin-bottom: 12px;">🏪 Sub-Orders Created (${response.childOrders.length})</strong>
              ${response.childOrders.map((child: any, index: number) => `
                <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <strong>${index + 1}. ${child.vendorName}</strong><br>
                  <span style="font-size: 13px; color: #666;">
                    ${child.itemCount} items • ${child.totalQuantity}kg<br>
                    Status: <span style="color: #ff9800;">Awaiting Packing</span><br>
                    Order: ${child.orderNumber}
                  </span>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: left; background: #e8f5e9; padding: 12px; border-radius: 8px;">
              <strong style="display: block; margin-bottom: 4px;">⏱️ Next Steps</strong>
              <p style="margin: 0; font-size: 13px; line-height: 1.6;">
                • Vendors notified to pack items<br>
                • You'll get real-time updates<br>
                • Delivery within 2-4 hours
              </p>
            </div>
          `,
          buttons: [{
            text: 'Track Orders',
            cssClass: 'track-order-btn',
            handler: () => {
              this.router.navigate(['/orders']);
            }
          }]
        });
        await successAlert.present();
      },
      error: (error) => {
        loading.dismiss();
        console.error('Order creation failed:', error);
        this.showToast('Payment received but order creation failed. Contact support.', 'danger');
      }
    });
  }

  async checkout_old() {
    if (!this.cart?.cartItems || this.cart.cartItems.length === 0) {
      this.showToast('Cart is empty', 'warning');
      return;
    }
    
    if (!this.deliveryAddress) {
      this.showToast('Please enter delivery address', 'warning');
      return;
    }

    // Show escrow payment confirmation
    const alert = await this.alertController.create({
      header: 'Secure Escrow Payment',
      message: `
        <strong>Total Landing Cost: ₹${this.totalLandingCost}</strong><br><br>
        <ul style="text-align: left; padding-left: 20px;">
          <li>Produce: ₹${this.produceTotal}</li>
          <li>Logistics: ₹${this.logisticsFee}</li>
          <li>Service Fee: ₹${this.serviceFee}</li>
        </ul>
        <br>
        Your payment will be held in a <strong>secure escrow account</strong> and vendors will be notified to prepare your order.
      `,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Pay Now',
          handler: async () => {
            await this.createEscrowOrder();
          }
        }
      ]
    });

    await alert.present();
  }

  async createEscrowOrder() {
    const loading = await this.loadingController.create({
      message: 'Processing escrow payment...'
    });
    await loading.present();

    const orderRequest = {
      items: this.cart!.cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        vendorId: item.vendorId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      deliveryAddress: this.deliveryAddress,
      produceTotal: this.produceTotal,
      logisticsFee: this.logisticsFee,
      serviceFee: this.serviceFee,
      totalLandingCost: this.totalLandingCost,
      paymentMethod: 'Escrow',
      isEscrow: true
    };

    // Call new unified checkout endpoint that handles order splitting
    this.orderService.checkout(orderRequest).subscribe({
      next: async (response) => {
        loading.dismiss();
        
        const vendorCount = response.vendors?.length || this.vendorGroups.size;
        const vendorSummary = response.vendors?.map((v: any) => 
          `• ${v.itemCount} items (${v.totalQuantity}kg) = ₹${v.subtotal}`
        ).join('<br>') || '';
        
        // Show success with order split confirmation
        const successAlert = await this.alertController.create({
          header: '✓ Order Placed Successfully',
          message: `
            <div style="text-align: center;">
              <ion-icon name="checkmark-circle" color="success" style="font-size: 64px;"></ion-icon><br>
              <strong style="font-size: 18px;">Order ${response.order.orderNumber}</strong><br><br>
            </div>
            
            <div style="text-align: left;">
              <strong>🔐 Escrow Payment</strong><br>
              ₹${this.totalLandingCost} secured in escrow<br><br>
              
              <strong>📦 Order Split</strong><br>
              ${vendorCount} vendors notified:<br>
              ${vendorSummary}<br><br>
              
              <strong>⏱️ Next Steps</strong><br>
              • Vendors preparing items<br>
              • You'll get updates as they mark ready<br>
              • Transporter assigned automatically<br>
              • Delivery within 2-4 hours<br><br>
              
              <small style="color: #666;">
                Funds held until delivery confirmed
              </small>
            </div>
          `,
          buttons: [{
            text: 'Track Order',
            handler: () => {
              this.router.navigate(['/orders', response.order.id]);
            }
          }]
        });
        await successAlert.present();
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error creating order:', error);
        this.showToast('Failed to create order', 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  getVendorItems(vendorKey: string): CartItem[] {
    return this.vendorGroups.get(vendorKey) || [];
  }

  getVendorIds(): string[] {
    return Array.from(this.vendorGroups.keys());
  }

  getVendorName(vendorKey: string): string {
    const parts = vendorKey.split('-');
    return parts.slice(1).join('-') || 'Unknown Vendor';
  }

  getVendorId(vendorKey: string): string {
    return vendorKey.split('-')[0];
  }

  getVendorSubtotal(vendorKey: string): number {
    const items = this.vendorGroups.get(vendorKey) || [];
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  proceedToCheckout() {
    this.checkout();
  }
}
