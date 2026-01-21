import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';

interface MandiHeatmap {
  mandiId: string;
  mandiName: string;
  latitude: number;
  longitude: number;
  activeOrders: number;
  availableTransporters: number;
  demandScore: number; // Higher = more demand, less supply
  color: string; // Red (high demand), Yellow (medium), Green (low demand)
}

interface StuckOrder {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  vendorName: string;
  transporterName: string;
  transporterId: string;
  status: string;
  assignedAt: Date;
  stuckDuration: number; // minutes
  currentLocation?: { latitude: number; longitude: number };
  pickupLocation: string;
  deliveryLocation: string;
  isMoving: boolean;
}

interface AvailableTransporter {
  id: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  assignedMandiId: string;
  currentLocation?: { latitude: number; longitude: number };
  isAvailable: boolean;
  activeOrders: number;
}

@Component({
  selector: 'app-logistics',
  templateUrl: './logistics.page.html',
  styleUrls: ['./logistics.page.scss'],
})
export class LogisticsPage implements OnInit, OnDestroy {
  selectedNavTab = 'logistics';
  selectedTab: 'heatmap' | 'stuck' | 'tracking' = 'heatmap';
  
  // Heatmap data
  mandiHeatmaps: MandiHeatmap[] = [];
  
  // Stuck orders
  stuckOrders: StuckOrder[] = [];
  stuckThresholdMinutes = 30;
  autoRefreshEnabled = true;
  
  // Available transporters for re-assignment
  availableTransporters: AvailableTransporter[] = [];
  selectedOrderForReassign: StuckOrder | null = null;
  
  // SignalR connection
  private hubConnection?: signalR.HubConnection;
  
  // Real-time stats
  totalActiveOrders = 0;
  totalAvailableTransporters = 0;
  totalStuckOrders = 0;
  
  useMockData = false; // Backend integration enabled
  
  // Loading states
  isLoadingHeatmap = false;
  isLoadingStuckOrders = false;
  heatmapError: string = '';
  stuckOrdersError: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadHeatmapData();
    this.loadStuckOrders();
    this.connectToSignalR();
    
    // Auto-refresh stuck orders every minute
    if (this.autoRefreshEnabled) {
      setInterval(() => {
        this.loadStuckOrders();
      }, 60000);
    }
  }

  ngOnDestroy() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  // ==================== SIGNALR CONNECTION ====================

  connectToSignalR() {
    if (this.useMockData) {
      this.simulateRealTimeUpdates();
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.logisticsHubUrl}/hubs/logistics`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('OrderLocationUpdated', (orderId: string, location: any) => {
      this.updateOrderLocation(orderId, location);
    });

    this.hubConnection.on('TransporterStatusChanged', (transporterId: string, status: string) => {
      this.updateTransporterStatus(transporterId, status);
    });

    this.hubConnection.on('OrderStuck', (orderId: string) => {
      this.flagOrderAsStuck(orderId);
    });

    this.hubConnection.start()
      .then(() => console.log('✅ Connected to Logistics Hub'))
      .catch(err => console.error('❌ SignalR connection error:', err));
  }

  simulateRealTimeUpdates() {
    // Mock: Simulate location updates every 10 seconds
    setInterval(() => {
      if (this.stuckOrders.length > 0 && Math.random() > 0.7) {
        const randomOrder = this.stuckOrders[Math.floor(Math.random() * this.stuckOrders.length)];
        randomOrder.isMoving = !randomOrder.isMoving;
        randomOrder.stuckDuration += 1;
      }
    }, 10000);
  }

  // ==================== HEATMAP ====================

  loadHeatmapData() {
    if (this.useMockData) {
      this.mandiHeatmaps = [
        {
          mandiId: 'mandi-001',
          mandiName: 'Azadpur Mandi, Delhi',
          latitude: 28.7041,
          longitude: 77.1750,
          activeOrders: 45,
          availableTransporters: 12,
          demandScore: 3.75, // 45/12 = high demand
          color: '#ff4444' // Red
        },
        {
          mandiId: 'mandi-002',
          mandiName: 'Mumbai APMC, Vashi',
          latitude: 19.0760,
          longitude: 73.0097,
          activeOrders: 32,
          availableTransporters: 18,
          demandScore: 1.78, // 32/18 = medium demand
          color: '#ffaa00' // Yellow
        },
        {
          mandiId: 'mandi-003',
          mandiName: 'Bangalore APMC, Yeshwanthpur',
          latitude: 13.0281,
          longitude: 77.5467,
          activeOrders: 15,
          availableTransporters: 22,
          demandScore: 0.68, // 15/22 = low demand
          color: '#00cc66' // Green
        },
        {
          mandiId: 'mandi-004',
          mandiName: 'Okhla Mandi, Delhi',
          latitude: 28.5355,
          longitude: 77.2730,
          activeOrders: 28,
          availableTransporters: 8,
          demandScore: 3.5, // 28/8 = high demand
          color: '#ff4444' // Red
        },
        {
          mandiId: 'mandi-005',
          mandiName: 'Ghazipur Mandi, Delhi',
          latitude: 28.6692,
          longitude: 77.3235,
          activeOrders: 18,
          availableTransporters: 15,
          demandScore: 1.2, // 18/15 = medium-low demand
          color: '#00cc66' // Green
        }
      ];
      
      this.totalActiveOrders = this.mandiHeatmaps.reduce((sum, m) => sum + m.activeOrders, 0);
      this.totalAvailableTransporters = this.mandiHeatmaps.reduce((sum, m) => sum + m.availableTransporters, 0);
    } else {
      this.isLoadingHeatmap = true;
      this.heatmapError = '';
      
      this.http.get<MandiHeatmap[]>(`${environment.apiUrl}/logistics/heatmap`)
        .subscribe({
          next: (data) => {
            this.mandiHeatmaps = data;
            this.totalActiveOrders = data.reduce((sum, m) => sum + m.activeOrders, 0);
            this.totalAvailableTransporters = data.reduce((sum, m) => sum + m.availableTransporters, 0);
            this.isLoadingHeatmap = false;
          },
          error: (err) => {
            console.error('Failed to load heatmap data:', err);
            this.heatmapError = 'Failed to load heatmap data. Please try again.';
            this.isLoadingHeatmap = false;
            this.showToast('Failed to load heatmap data', 'danger');
          }
        });
    }
  }

  // ==================== STUCK ORDERS ====================

  loadStuckOrders() {
    if (this.useMockData) {
      const now = new Date();
      this.stuckOrders = [
        {
          orderId: 'order-001',
          orderNumber: 'ORD-20260120-001',
          buyerName: 'Raj Restaurant',
          vendorName: 'Rajesh Kumar',
          transporterName: 'Amit Singh',
          transporterId: 'trans-001',
          status: 'Driver Assigned',
          assignedAt: new Date(now.getTime() - 45 * 60000), // 45 minutes ago
          stuckDuration: 45,
          currentLocation: { latitude: 28.6315, longitude: 77.2167 },
          pickupLocation: 'Azadpur Mandi, Delhi',
          deliveryLocation: 'Connaught Place, Delhi',
          isMoving: false
        },
        {
          orderId: 'order-002',
          orderNumber: 'ORD-20260120-002',
          buyerName: 'Grand Hotel',
          vendorName: 'Priya Sharma',
          transporterName: 'Vijay Kumar',
          transporterId: 'trans-002',
          status: 'In Transit',
          assignedAt: new Date(now.getTime() - 62 * 60000), // 62 minutes ago
          stuckDuration: 62,
          currentLocation: { latitude: 19.0760, longitude: 73.0097 },
          pickupLocation: 'Mumbai APMC, Vashi',
          deliveryLocation: 'Hotel Grand, Mumbai',
          isMoving: false
        },
        {
          orderId: 'order-003',
          orderNumber: 'ORD-20260120-003',
          buyerName: 'City Supermarket',
          vendorName: 'Lakshmi Reddy',
          transporterName: 'Ravi Verma',
          transporterId: 'trans-003',
          status: 'Driver Assigned',
          assignedAt: new Date(now.getTime() - 35 * 60000), // 35 minutes ago
          stuckDuration: 35,
          pickupLocation: 'Okhla Mandi, Delhi',
          deliveryLocation: 'Karol Bagh, Delhi',
          isMoving: false
        }
      ];
      
      this.totalStuckOrders = this.stuckOrders.length;
    } else {
      this.isLoadingStuckOrders = true;
      this.stuckOrdersError = '';
      
      this.http.get<StuckOrder[]>(`${environment.apiUrl}/logistics/stuck-orders?threshold=${this.stuckThresholdMinutes}`)
        .subscribe({
          next: (data) => {
            this.stuckOrders = data;
            this.totalStuckOrders = data.length;
            this.isLoadingStuckOrders = false;
          },
          error: (err) => {
            console.error('Failed to load stuck orders:', err);
            this.stuckOrdersError = 'Failed to load stuck orders. Please try again.';
            this.isLoadingStuckOrders = false;
            this.showToast('Failed to load stuck orders', 'danger');
          }
        });
    }
  }

  updateOrderLocation(orderId: string, location: any) {
    const order = this.stuckOrders.find(o => o.orderId === orderId);
    if (order) {
      order.currentLocation = location;
      order.isMoving = true;
    }
  }

  updateTransporterStatus(transporterId: string, status: string) {
    const transporter = this.availableTransporters.find(t => t.id === transporterId);
    if (transporter) {
      transporter.isAvailable = status === 'available';
    }
  }

  flagOrderAsStuck(orderId: string) {
    const existingOrder = this.stuckOrders.find(o => o.orderId === orderId);
    if (!existingOrder) {
      this.loadStuckOrders();
      this.showToast(`⚠️ Order ${orderId} has been stuck for over ${this.stuckThresholdMinutes} minutes`, 'warning');
    }
  }

  viewOrderOnMap(order: StuckOrder) {
    if (order.currentLocation) {
      const url = `https://www.google.com/maps?q=${order.currentLocation.latitude},${order.currentLocation.longitude}`;
      window.open(url, '_blank');
    } else {
      this.showToast('No current location available', 'warning');
    }
  }

  viewMandiOnMap(latitude: number, longitude: number) {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  }

  // ==================== DRIVER RE-ASSIGNMENT ====================

  async openReassignDialog(order: StuckOrder) {
    this.selectedOrderForReassign = order;
    
    // Load available transporters for the same mandi
    if (this.useMockData) {
      this.availableTransporters = [
        {
          id: 'trans-004',
          fullName: 'Rajesh Kumar',
          phoneNumber: '+91 98765 43210',
          vehicleType: 'Tempo (Mini Truck)',
          vehicleNumber: 'DL-2345-6789',
          assignedMandiId: 'mandi-001',
          currentLocation: { latitude: 28.7041, longitude: 77.1750 },
          isAvailable: true,
          activeOrders: 2
        },
        {
          id: 'trans-005',
          fullName: 'Suresh Patel',
          phoneNumber: '+91 99887 65432',
          vehicleType: 'Pick-up Truck',
          vehicleNumber: 'DL-3456-7890',
          assignedMandiId: 'mandi-001',
          isAvailable: true,
          activeOrders: 1
        },
        {
          id: 'trans-006',
          fullName: 'Manoj Singh',
          phoneNumber: '+91 98776 54321',
          vehicleType: 'Van',
          vehicleNumber: 'DL-4567-8901',
          assignedMandiId: 'mandi-001',
          isAvailable: true,
          activeOrders: 0
        }
      ];
    } else {
      // TODO: Call backend API
      // this.httpClient.get<AvailableTransporter[]>(`/api/logistics/available-transporters?mandiId=${order.mandiId}`).subscribe(...)
    }

    const alert = await this.alertController.create({
      header: 'Re-assign Driver',
      message: `Select a new transporter for order <strong>${order.orderNumber}</strong>`,
      inputs: this.availableTransporters.map(t => ({
        type: 'radio' as const,
        label: `${t.fullName} - ${t.vehicleNumber} (${t.activeOrders} active orders)`,
        value: t.id
      })),
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Re-assign',
          handler: (newTransporterId: string) => {
            if (newTransporterId) {
              this.reassignDriver(order, newTransporterId);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async reassignDriver(order: StuckOrder, newTransporterId: string) {
    const newTransporter = this.availableTransporters.find(t => t.id === newTransporterId);
    
    if (!newTransporter) {
      this.showToast('❌ Transporter not found', 'danger');
      return;
    }

    const confirm = await this.alertController.create({
      header: 'Confirm Re-assignment',
      message: `
        <p><strong>Order:</strong> ${order.orderNumber}</p>
        <p><strong>From:</strong> ${order.transporterName}</p>
        <p><strong>To:</strong> ${newTransporter.fullName}</p>
        <p><strong>Vehicle:</strong> ${newTransporter.vehicleNumber}</p>
        <p>Are you sure you want to re-assign this order?</p>
      `,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Confirm',
          handler: () => {
            if (this.useMockData) {
              // Mock: Update order
              order.transporterName = newTransporter.fullName;
              order.transporterId = newTransporter.id;
              order.assignedAt = new Date();
              order.stuckDuration = 0;
              order.isMoving = false;
              
              // Remove from stuck orders
              this.stuckOrders = this.stuckOrders.filter(o => o.orderId !== order.orderId);
              this.totalStuckOrders = this.stuckOrders.length;
              
              this.showToast(`✅ Order re-assigned to ${newTransporter.fullName}`, 'success');
              this.selectedOrderForReassign = null;
            } else {
              // TODO: Call backend API
              // this.httpClient.post(`/api/logistics/reassign`, { orderId: order.orderId, newTransporterId }).subscribe(...)
            }
          }
        }
      ]
    });

    await confirm.present();
  }

  // ==================== NAVIGATION ====================

  navigateToTab(event: any) {
    const tab = event.detail.value;
    const routes: { [key: string]: string } = {
      'verification': '/admin/verification',
      'users': '/admin/users',
      'hubs': '/admin/hubs',
      'marketplace': '/admin/marketplace',
      'logistics': '/admin/logistics'
    };
    
    if (routes[tab]) {
      this.router.navigate([routes[tab]]);
    }
  }

  onSubTabChange(event: any) {
    this.selectedTab = event.detail.value;
  }

  // ==================== UTILITIES ====================

  getDemandColor(score: number): string {
    if (score >= 3) return 'danger';
    if (score >= 1.5) return 'warning';
    return 'success';
  }

  getDemandLabel(score: number): string {
    if (score >= 3) return 'High Demand';
    if (score >= 1.5) return 'Medium Demand';
    return 'Low Demand';
  }

  getStuckDurationColor(minutes: number): string {
    if (minutes >= 60) return 'danger';
    if (minutes >= 45) return 'warning';
    return 'medium';
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary' = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
