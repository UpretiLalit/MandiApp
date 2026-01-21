import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, ModalController } from '@ionic/angular';
import { environment } from '@environments/environment';

interface OrderItem {
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: 'Pending' | 'Processing' | 'PickedUp' | 'InTransit' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  vendorName: string;
  vendorContact: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  items: OrderItem[];
  invoiceUrl?: string;
  trackingEnabled: boolean;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = 'all';
  loading: boolean = false;

  statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'InTransit', label: 'In Transit' },
    { value: 'Delivered', label: 'Delivered' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    
    // Load real orders from backend
    this.http.get<any[]>(`${environment.orderingApiUrl}/orders`)
      .subscribe({
        next: (response: any) => {
          console.log('Orders loaded from backend:', response);
          
          // Transform backend orders to match our interface
          this.orders = response.map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            orderDate: new Date(order.createdAt || Date.now()).toLocaleString(),
            status: order.status,
            totalAmount: order.totalAmount || 0,
            gstAmount: order.totalAmount * 0.05 || 0,
            grandTotal: order.totalAmount * 1.05 || 0,
            vendorName: order.vendorName || 'Vendor',
            vendorContact: '+91 98765 43210',
            deliveryAddress: order.deliveryAddress || 'Not specified',
            estimatedDelivery: 'Within 2-4 hours',
            trackingEnabled: true,
            items: order.orderItems?.map((item: any) => ({
              productName: item.productName,
              quantity: item.quantity,
              unit: 'kg',
              pricePerUnit: item.unitPrice,
              total: item.totalPrice
            })) || []
          }));
          
          this.filteredOrders = [...this.orders];
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load orders:', err);
          this.loading = false;
          
          // Fallback to empty if API fails
          this.orders = [];
          this.filteredOrders = [];
        }
      });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    
    if (status === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(o => o.status === status);
    }
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'Pending': 'warning',
      'Processing': 'primary',
      'PickedUp': 'secondary',
      'InTransit': 'tertiary',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return colors[status] || 'medium';
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      'Pending': 'time-outline',
      'Processing': 'hourglass-outline',
      'PickedUp': 'cube-outline',
      'InTransit': 'car-outline',
      'Delivered': 'checkmark-done-outline',
      'Cancelled': 'close-circle-outline'
    };
    return icons[status] || 'ellipsis-horizontal';
  }

  trackOrder(order: Order) {
    if (order.trackingEnabled) {
      this.router.navigate(['/tracking', order.id]);
    } else {
      this.showAlert('Tracking Not Available', 'Real-time tracking is only available for orders in transit.');
    }
  }

  async viewInvoice(order: Order) {
    if (order.invoiceUrl) {
      window.open(order.invoiceUrl, '_blank');
    } else if (order.status === 'Delivered') {
      // Generate invoice
      await this.generateInvoice(order);
    } else {
      this.showAlert('Invoice Not Ready', 'Invoice will be available once the order is delivered.');
    }
  }

  async generateInvoice(order: Order) {
    const alert = await this.alertController.create({
      header: 'Generate Invoice',
      message: 'GST-compliant invoice will be generated and sent to your email.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Generate',
          handler: () => {
            // Call API to generate invoice
            this.showAlert('Success', 'Invoice generated successfully!');
          }
        }
      ]
    });
    await alert.present();
  }

  async reportIssue(order: Order) {
    const alert = await this.alertController.create({
      header: 'Report Issue',
      message: `Order: ${order.orderNumber}`,
      inputs: [
        {
          type: 'radio',
          label: 'Rotten/Damaged Items',
          value: 'rotten',
          checked: true
        },
        {
          type: 'radio',
          label: 'Missing Items',
          value: 'missing'
        },
        {
          type: 'radio',
          label: 'Wrong Items Delivered',
          value: 'wrong'
        },
        {
          type: 'radio',
          label: 'Late Delivery',
          value: 'late'
        },
        {
          type: 'radio',
          label: 'Other',
          value: 'other'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Next',
          handler: (issueType) => {
            this.showIssueDetails(order, issueType);
          }
        }
      ]
    });
    await alert.present();
  }

  async showIssueDetails(order: Order, issueType: string) {
    const alert = await this.alertController.create({
      header: 'Describe the Issue',
      inputs: [
        {
          name: 'details',
          type: 'textarea',
          placeholder: 'Provide more details about the issue...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit',
          handler: (data) => {
            this.submitDispute(order, issueType, data.details);
          }
        }
      ]
    });
    await alert.present();
  }

  async submitDispute(order: Order, issueType: string, details: string) {
    // Call API to submit dispute
    const alert = await this.alertController.create({
      header: 'Dispute Submitted',
      message: 'Your issue has been reported. Our team will review it within 24 hours.',
      cssClass: 'success-alert',
      buttons: ['OK']
    });
    await alert.present();
  }

  async reorder(order: Order) {
    const alert = await this.alertController.create({
      header: 'Reorder Items',
      message: `Add all items from order ${order.orderNumber} to your cart?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add to Cart',
          handler: () => {
            // Add items to cart
            this.router.navigate(['/cart']);
          }
        }
      ]
    });
    await alert.present();
  }

  callVendor(phone: string) {
    window.open(`tel:${phone}`, '_system');
  }
  
  // Phase 3: Buyer confirms delivery by scanning QR
  async confirmDelivery(order: Order) {
    const alert = await this.alertController.create({
      header: '✓ Confirm Delivery',
      message: `Order: ${order.orderNumber}\n\nVendor: ${order.vendorName}\n\nInspect items for quality before confirming. Once confirmed, payment will be released from escrow.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: '✓ Confirm Quality & Delivery',
          cssClass: 'confirm-delivery-btn',
          handler: () => {
            this.processDeliveryConfirmation(order);
          }
        }
      ]
    });
    await alert.present();
  }
  
  async processDeliveryConfirmation(order: Order) {
    this.loading = true;
    
    console.log('Confirming delivery for order:', order.id);
    console.log('API URL:', `${environment.orderingApiUrl}/orders/${order.id}/confirm-delivery`);
    
    this.http.post(`${environment.orderingApiUrl}/orders/${order.id}/confirm-delivery`, {})
      .subscribe({
        next: async (response: any) => {
          this.loading = false;
          console.log('Delivery confirmed successfully:', response);
          
          // Show success with payout breakdown
          const successAlert = await this.alertController.create({
            header: '✓ Delivery Confirmed',
            message: `Escrow Released Successfully\n\n✓ Vendors Paid: ₹${response.payouts.vendors}\n✓ Transporter Paid: ₹${response.payouts.transporter}\n✓ Platform Fee: ₹${response.payouts.platform}\n\nDelivery QR: ${response.deliveryQRCode}`,
            cssClass: 'success-alert',
            buttons: ['OK']
          });
          await successAlert.present();
          
          // Reload orders to reflect new status
          this.loadOrders();
        },
        error: async (err) => {
          this.loading = false;
          console.error('Delivery confirmation error:', err);
          console.error('Error details:', JSON.stringify(err, null, 2));
          
          let errorMessage = 'Unable to confirm delivery. Please try again.';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 401) {
            errorMessage = 'Unauthorized. Please login again.';
          } else if (err.status === 400) {
            errorMessage = err.error?.message || 'Order must be In Transit to confirm delivery.';
          } else if (err.status === 0) {
            errorMessage = 'Cannot connect to server. Please check if backend is running.';
          }
          
          const errorAlert = await this.alertController.create({
            header: 'Confirmation Failed',
            message: errorMessage,
            buttons: ['OK']
          });
          await errorAlert.present();
        }
      });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Demo: Simulate order progression for testing
  async simulateOrderProgress(order: Order) {
    const alert = await this.alertController.create({
      header: '🧪 Demo Mode',
      message: `Simulate order ${order.orderNumber} progression?\n\nThis will move the order through:\n• VendorsNotified\n• ReadyForPickup\n• PickedUp\n• InTransit\n\nYou can then test delivery confirmation.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Simulate',
          handler: () => {
            this.progressOrderToInTransit(order);
          }
        }
      ]
    });
    await alert.present();
  }

  async progressOrderToInTransit(order: Order) {
    this.loading = true;
    
    console.log('Progressing order to InTransit:', order.id);
    
    // Call backend to actually update order status
    this.http.put(`${environment.orderingApiUrl}/orders/${order.id}/demo-status`, { status: 'InTransit' })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          order.status = 'InTransit';
          this.showAlert('✓ Demo Complete', `Order ${order.orderNumber} is now In Transit.\n\nYou can now test "Confirm Delivery" button.`);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to update order status:', err);
          this.showAlert('Error', 'Failed to update order status. Check console for details.');
        }
      });
  }

  doRefresh(event: any) {
    this.loadOrders();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
