import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, ModalController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { OrderService } from '@app/core/services/order.service';

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
  completedTime?: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  orders: VendorOrder[] = [];
  filteredOrders: VendorOrder[] = [];
  selectedTab: 'active' | 'completed' = 'active';
  loading: boolean = false;
  showQRModal: boolean = false;
  selectedOrder: VendorOrder | null = null;
  notificationCount: number = 2;

  // Statistics
  todaySales: number = 0;
  pendingCount: number = 0;
  readyCount: number = 0;
  inTransitCount: number = 0;
  completedToday: number = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private modalController: ModalController,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    
    // Load from backend API
    this.orderService.getVendorOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.calculateStatistics();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading vendor orders:', err);
        this.loading = false;
        
        // Fallback to empty array
        this.orders = [];
        this.calculateStatistics();
        this.applyFilter();
      }
    });
  }

  calculateStatistics() {
    // Count by status
    this.pendingCount = this.orders.filter(o => o.status === 'Pending').length;
    this.readyCount = this.orders.filter(o => o.status === 'Ready').length;
    this.inTransitCount = this.orders.filter(o => o.status === 'PickedUp').length;
    
    // Today's sales
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = this.orders.filter(o => 
      o.orderDate.includes(today) && o.status === 'Completed'
    );
    
    this.completedToday = todayOrders.length;
    this.todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }

  changeTab(tab: 'active' | 'completed') {
    this.selectedTab = tab;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedTab === 'active') {
      this.filteredOrders = this.orders.filter(o => 
        o.status === 'Pending' || o.status === 'Processing' || o.status === 'Ready' || o.status === 'PickedUp'
      );
    } else {
      this.filteredOrders = this.orders.filter(o => 
        o.status === 'Completed' || o.status === 'Cancelled'
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

  acceptOrder(order: VendorOrder) {
    // Frictionless - call backend API directly
    this.orderService.acceptOrder(order.id).subscribe({
      next: () => {
        order.status = 'Processing';
        this.calculateStatistics();
        this.applyFilter();
        
        const toast = document.createElement('ion-toast');
        toast.message = `✅ Order ${order.orderNumber} accepted! Start packing items.`;
        toast.duration = 2000;
        toast.color = 'success';
        document.body.appendChild(toast);
        toast.present();
      },
      error: (err) => {
        console.error('Error accepting order:', err);
        const toast = document.createElement('ion-toast');
        toast.message = '❌ Failed to accept order. Please try again.';
        toast.duration = 2000;
        toast.color = 'danger';
        document.body.appendChild(toast);
        toast.present();
      }
    });
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

  // New methods for timeline and workflow
  getStatusLabel(status: string): string {
    const labels: any = {
      'Pending': 'New Order',
      'Processing': 'Packing',
      'Ready': 'Ready',
      'PickedUp': 'Pickup',
      'Completed': 'Delivered'
    };
    return labels[status] || status;
  }

  getTotalQuantity(order: VendorOrder): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  markReadyForPickup(order: VendorOrder) {
    // Frictionless - call backend API directly
    this.orderService.markOrderReady(order.id).subscribe({
      next: () => {
        order.status = 'Ready';
        order.pickupQRCode = `QR-${order.orderNumber}-${Date.now()}`;
        this.calculateStatistics();
        this.applyFilter();
        this.notificationCount++;
        
        const toast = document.createElement('ion-toast');
        toast.message = `✅ ${order.orderNumber} marked ready! QR code generated.`;
        toast.duration = 2000;
        toast.color = 'success';
        document.body.appendChild(toast);
        toast.present();
      },
      error: (err) => {
        console.error('Error marking order ready:', err);
        const toast = document.createElement('ion-toast');
        toast.message = '❌ Failed to mark order ready. Please try again.';
        toast.duration = 2000;
        toast.color = 'danger';
        document.body.appendChild(toast);
        toast.present();
      }
    });
  }

  async generateInvoice(order: VendorOrder) {
    const toast = document.createElement('ion-toast');
    toast.message = 'Generating invoice...';
    toast.duration = 1500;
    toast.color = 'primary';
    document.body.appendChild(toast);
    await toast.present();

    // Simulate invoice generation
    setTimeout(async () => {      
      const successToast = document.createElement('ion-toast');
      successToast.message = `📄 Invoice generated for ${order.orderNumber}`;
      successToast.duration = 2500;
      successToast.color = 'success';
      document.body.appendChild(successToast);
      successToast.present();
      
      // In real app, download PDF or open in viewer
      console.log('Invoice data:', order);
    }, 1500);
  }

  async viewInvoice(order: VendorOrder) {
    const alert = await this.alertController.create({
      header: `Invoice - ${order.orderNumber}`,
      message: `
        <div style="text-align: left; padding: 10px;">
          <strong>${order.buyerName}</strong><br>
          ${order.deliveryAddress}<br><br>
          <strong>Items:</strong><br>
          ${order.items.map(item => 
            `${item.productName}: ${item.quantity} ${item.unit} × ₹${item.price} = ₹${item.total}`
          ).join('<br>')}<br><br>
          <strong>Total: ₹${order.totalAmount}</strong><br>
          <small>Date: ${order.orderDate}</small>
        </div>
      `,
      buttons: [
        { text: 'Download PDF', handler: () => console.log('Download PDF') },
        { text: 'Close', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  async trackDelivery(order: VendorOrder) {
    const alert = await this.alertController.create({
      header: '🚚 Track Delivery',
      message: `
        <div style="text-align: left;">
          <strong>${order.orderNumber}</strong><br><br>
          📍 Status: In Transit<br>
          🕐 Picked up: ${order.pickupTime || 'N/A'}<br>
          📍 Destination: ${order.deliveryAddress}<br><br>
          <small>Estimated delivery: 30-45 minutes</small>
        </div>
      `,
      buttons: ['Close']
    });
    await alert.present();
  }

  async archiveOrder(order: VendorOrder) {
    const alert = await this.alertController.create({
      header: 'Archive Order',
      message: `Archive ${order.orderNumber}? This will move it to history.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Archive',
          handler: () => {
            // Remove from list or mark as archived
            const index = this.orders.indexOf(order);
            if (index > -1) {
              this.orders.splice(index, 1);
              this.calculateStatistics();
              this.applyFilter();
              
              const toast = document.createElement('ion-toast');
              toast.message = `${order.orderNumber} archived`;
              toast.duration = 2000;
              document.body.appendChild(toast);
              toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  showNotifications() {
    console.log('Show notifications');
    // Navigate to notifications page or show modal
  }
}
