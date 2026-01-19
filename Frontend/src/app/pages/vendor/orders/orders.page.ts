import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, ModalController } from '@ionic/angular';
import { environment } from '@environments/environment';

interface OrderItem {
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

interface VendorOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: 'Pending' | 'Processing' | 'Ready' | 'PickedUp' | 'Completed' | 'Cancelled';
  buyerName: string;
  buyerContact: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  pickupQRCode?: string;
  pickupTime?: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  orders: VendorOrder[] = [];
  filteredOrders: VendorOrder[] = [];
  selectedTab: 'pending' | 'history' = 'pending';
  loading: boolean = false;
  showQRModal: boolean = false;
  selectedOrder: VendorOrder | null = null;

  // Statistics
  todaySales: number = 0;
  pendingCount: number = 0;
  completedToday: number = 0;

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
          status: 'Pending',
          buyerName: 'Restaurant ABC',
          buyerContact: '+91 98765 43210',
          deliveryAddress: 'S.G. Highway, Ahmedabad',
          items: [
            { productName: 'Tomato', quantity: 10, unit: 'kg', price: 40, total: 400 },
            { productName: 'Onion', quantity: 15, unit: 'kg', price: 35, total: 525 }
          ],
          totalAmount: 925,
          pickupQRCode: 'PICKUP-ORD-2026-001-VND-123'
        },
        {
          id: 2,
          orderNumber: 'ORD-2026-002',
          orderDate: '2026-01-13 08:15 AM',
          status: 'Ready',
          buyerName: 'Hotel XYZ',
          buyerContact: '+91 98765 43211',
          deliveryAddress: 'Satellite Road, Ahmedabad',
          items: [
            { productName: 'Potato', quantity: 20, unit: 'kg', price: 25, total: 500 }
          ],
          totalAmount: 500,
          pickupQRCode: 'PICKUP-ORD-2026-002-VND-123'
        },
        {
          id: 3,
          orderNumber: 'ORD-2026-003',
          orderDate: '2026-01-12 03:45 PM',
          status: 'Completed',
          buyerName: 'Cafe 456',
          buyerContact: '+91 98765 43212',
          deliveryAddress: 'Paldi, Ahmedabad',
          items: [
            { productName: 'Cabbage', quantity: 8, unit: 'kg', price: 30, total: 240 }
          ],
          totalAmount: 240,
          pickupTime: '2026-01-12 04:30 PM'
        },
        {
          id: 4,
          orderNumber: 'ORD-2026-004',
          orderDate: '2026-01-12 10:00 AM',
          status: 'Completed',
          buyerName: 'Restaurant DEF',
          buyerContact: '+91 98765 43213',
          deliveryAddress: 'Vastrapur, Ahmedabad',
          items: [
            { productName: 'Carrot', quantity: 12, unit: 'kg', price: 45, total: 540 }
          ],
          totalAmount: 540,
          pickupTime: '2026-01-12 11:15 AM'
        }
      ];
      
      this.calculateStatistics();
      this.applyFilter();
      this.loading = false;
    }, 1000);
  }

  calculateStatistics() {
    this.pendingCount = this.orders.filter(o => 
      o.status === 'Pending' || o.status === 'Processing' || o.status === 'Ready'
    ).length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = this.orders.filter(o => 
      o.orderDate.includes(today) && o.status === 'Completed'
    );
    
    this.completedToday = todayOrders.length;
    this.todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }

  changeTab(tab: 'pending' | 'history') {
    this.selectedTab = tab;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedTab === 'pending') {
      this.filteredOrders = this.orders.filter(o => 
        o.status === 'Pending' || o.status === 'Processing' || o.status === 'Ready'
      );
    } else {
      this.filteredOrders = this.orders.filter(o => 
        o.status === 'PickedUp' || o.status === 'Completed' || o.status === 'Cancelled'
      );
    }
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'Pending': 'warning',
      'Processing': 'primary',
      'Ready': 'success',
      'PickedUp': 'secondary',
      'Completed': 'success',
      'Cancelled': 'danger'
    };
    return colors[status] || 'medium';
  }

  async acceptOrder(order: VendorOrder) {
    const alert = await this.alertController.create({
      header: 'Accept Order',
      message: `Accept order ${order.orderNumber}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Accept',
          handler: () => {
            order.status = 'Processing';
            this.showAlert('Order Accepted', 'You can now prepare the order');
          }
        }
      ]
    });
    await alert.present();
  }

  async markReady(order: VendorOrder) {
    const alert = await this.alertController.create({
      header: 'Mark as Ready',
      message: `
        <strong>Pack items and mark ready?</strong><br><br>
        ✓ Items will be marked for pickup<br>
        ✓ QR code will be generated<br>
        ✓ Waiting for other vendors<br><br>
        <small>Transporter assigned when all ready</small>
      `,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes, Ready',
          handler: async () => {
            // Call API
            this.http.post(
              `${environment.apiUrl}/orders/${order.id}/mark-ready`,
              {}
            ).subscribe({
              next: () => {
                order.status = 'Ready';
                order.pickupQRCode = `PICKUP-${order.orderNumber}-VND-${Date.now()}`;
                this.calculateStatistics();
                this.showAlert('Ready for Pickup', '✓ Items marked ready<br>✓ QR code generated');
              },
              error: (err) => console.error(err)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  viewQRCode(order: VendorOrder) {
    this.selectedOrder = order;
    this.showQRModal = true;
  }

  closeQRModal() {
    this.showQRModal = false;
    this.selectedOrder = null;
  }

  downloadQR() {
    const canvas = document.querySelector('qrcode canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${this.selectedOrder?.orderNumber}.png`;
      link.click();
    }
  }

  callBuyer(phone: string) {
    window.open(`tel:${phone}`, '_system');
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
