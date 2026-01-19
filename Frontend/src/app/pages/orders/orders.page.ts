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
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.orders = [
        {
          id: 1,
          orderNumber: 'ORD-2026-001',
          orderDate: '2026-01-13 09:30 AM',
          status: 'InTransit',
          totalAmount: 2500,
          gstAmount: 125,
          grandTotal: 2625,
          vendorName: 'Fresh Farms Co.',
          vendorContact: '+91 98765 43210',
          deliveryAddress: 'Restaurant ABC, S.G. Highway, Ahmedabad',
          estimatedDelivery: '2026-01-13 11:00 AM',
          trackingEnabled: true,
          items: [
            { productName: 'Tomato', quantity: 10, unit: 'kg', pricePerUnit: 40, total: 400 },
            { productName: 'Onion', quantity: 15, unit: 'kg', pricePerUnit: 35, total: 525 },
            { productName: 'Potato', quantity: 20, unit: 'kg', pricePerUnit: 25, total: 500 }
          ]
        },
        {
          id: 2,
          orderNumber: 'ORD-2026-002',
          orderDate: '2026-01-12 02:15 PM',
          status: 'Delivered',
          totalAmount: 1800,
          gstAmount: 90,
          grandTotal: 1890,
          vendorName: 'Green Valley Suppliers',
          vendorContact: '+91 98765 43211',
          deliveryAddress: 'Restaurant ABC, S.G. Highway, Ahmedabad',
          estimatedDelivery: '2026-01-12 05:00 PM',
          trackingEnabled: false,
          invoiceUrl: 'https://example.com/invoice-002.pdf',
          items: [
            { productName: 'Cabbage', quantity: 8, unit: 'kg', pricePerUnit: 30, total: 240 },
            { productName: 'Carrot', quantity: 12, unit: 'kg', pricePerUnit: 45, total: 540 }
          ]
        },
        {
          id: 3,
          orderNumber: 'ORD-2026-003',
          orderDate: '2026-01-11 10:00 AM',
          status: 'Delivered',
          totalAmount: 3200,
          gstAmount: 160,
          grandTotal: 3360,
          vendorName: 'Organic Harvest Ltd.',
          vendorContact: '+91 98765 43212',
          deliveryAddress: 'Restaurant ABC, S.G. Highway, Ahmedabad',
          estimatedDelivery: '2026-01-11 01:00 PM',
          trackingEnabled: false,
          invoiceUrl: 'https://example.com/invoice-003.pdf',
          items: [
            { productName: 'Cucumber', quantity: 10, unit: 'kg', pricePerUnit: 35, total: 350 },
            { productName: 'Bell Pepper', quantity: 5, unit: 'kg', pricePerUnit: 80, total: 400 }
          ]
        }
      ];
      
      this.filteredOrders = this.orders;
      this.loading = false;
    }, 1000);
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
      message: `
        <strong>Order:</strong> ${order.orderNumber}<br>
        <strong>Vendor:</strong> ${order.vendorName}<br><br>
        Inspect items for quality before confirming. 
        Once confirmed, payment will be released from escrow.
      `,
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
    
    this.http.post(`${environment.apiUrl}/api/orders/${order.id}/confirm-delivery`, {})
      .subscribe({
        next: async (response: any) => {
          this.loading = false;
          
          // Show success with payout breakdown
          const successAlert = await this.alertController.create({
            header: '✓ Delivery Confirmed',
            message: `
              <div style="text-align: left; padding: 10px;">
                <p><strong>Escrow Released Successfully</strong></p>
                <hr>
                <p>✓ Vendors Paid: ₹${response.payouts.vendors}</p>
                <p>✓ Transporter Paid: ₹${response.payouts.transporter}</p>
                <p>✓ Platform Fee: ₹${response.payouts.platform}</p>
                <hr>
                <p style="color: #10dc60;">
                  <ion-icon name="checkmark-circle"></ion-icon>
                  Delivery QR: ${response.deliveryQRCode}
                </p>
              </div>
            `,
            cssClass: 'success-alert',
            buttons: ['OK']
          });
          await successAlert.present();
          
          // Reload orders to reflect new status
          this.loadOrders();
        },
        error: async (err) => {
          this.loading = false;
          const errorAlert = await this.alertController.create({
            header: 'Confirmation Failed',
            message: err.error?.message || 'Unable to confirm delivery. Please try again.',
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

  doRefresh(event: any) {
    this.loadOrders();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
