import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

interface Delivery {
  id: number;
  orderId: number;
  orderNumber: string;
  status: 'Assigned' | 'Pending' | 'PickedUp' | 'InTransit' | 'Delivered';
  pickupAddress: string;
  deliveryAddress: string;
  pickupContact: string;
  deliveryContact: string;
  distance: string;
  estimatedTime: string;
  items: number;
  priority: 'High' | 'Normal' | 'Low';
  pickupTime?: string;
  deliveryTime?: string;
  qrCode?: string;
  // Load details
  totalWeight: number; // in kg
  totalVolume: number; // in cubic meters
  vehicleRequired: 'E-Rickshaw' | 'Mini-Truck' | 'Truck';
  // Earnings
  basePayment: number;
  fuelSurcharge: number;
  totalEarning: number;
  // Phase 2: Multi-vendor stops with optimized route
  vendors: Array<{
    vendorId: string;
    name: string;
    address: string;
    itemCount: number;
    qrCode: string;
    isPickedUp: boolean;
  }>;
  allVendorsReady: boolean;
  routeOptimized: boolean;
}

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['./deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit {
  deliveries: Delivery[] = [];
  filteredDeliveries: Delivery[] = [];
  selectedStatus: string = 'all';
  loading: boolean = false;

  statusFilters = [
    { value: 'all', label: 'All', icon: 'list-outline' },
    { value: 'Pending', label: 'Pending', icon: 'time-outline' },
    { value: 'PickedUp', label: 'Picked Up', icon: 'cube-outline' },
    { value: 'InTransit', label: 'In Transit', icon: 'car-outline' },
    { value: 'Delivered', label: 'Delivered', icon: 'checkmark-done-outline' }
  ];

  constructor(
    public router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadDeliveries();
  }

  loadDeliveries() {
    this.loading = true;
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.deliveries = [
        {
          id: 1,
          orderId: 101,
          orderNumber: 'ORD-2024-001',
          status: 'Assigned',
          pickupAddress: 'Multiple Vendors (2 stops)',
          deliveryAddress: 'Restaurant ABC, S.G. Highway, Ahmedabad',
          pickupContact: '+91 98765 43210',
          deliveryContact: '+91 98765 43211',
          distance: '15 km',
          estimatedTime: '25 mins',
          items: 5,
          priority: 'High',
          totalWeight: 45,
          totalVolume: 0.12,
          vehicleRequired: 'E-Rickshaw',
          basePayment: 250,
          fuelSurcharge: 30,
          totalEarning: 280,
          vendors: [
            { 
              vendorId: 'vnd-123',
              name: 'Fresh Farms Co.', 
              address: 'Shop 12, Mandi Yard A', 
              itemCount: 3,
              qrCode: 'PICKUP-ORD-2024-001-VND-123',
              isPickedUp: false
            },
            { 
              vendorId: 'vnd-456',
              name: 'Green Valley', 
              address: 'Shop 45, Mandi Yard B', 
              itemCount: 2,
              qrCode: 'PICKUP-ORD-2024-001-VND-456',
              isPickedUp: false
            }
          ],
          allVendorsReady: true,
          routeOptimized: true
        },
        {
          id: 2,
          orderId: 102,
          orderNumber: 'ORD-2024-002',
          status: 'PickedUp',
          pickupAddress: 'Single Vendor',
          deliveryAddress: 'Hotel XYZ, Satellite Road, Ahmedabad',
          pickupContact: '+91 98765 43212',
          deliveryContact: '+91 98765 43213',
          distance: '22 km',
          estimatedTime: '35 mins',
          items: 8,
          priority: 'Normal',
          totalWeight: 60,
          totalVolume: 0.18,
          vehicleRequired: 'Mini-Truck',
          basePayment: 350,
          fuelSurcharge: 42,
          totalEarning: 392,
          vendors: [
            {
              vendorId: 'vnd-789',
              name: 'Organic Hub',
              address: 'Shop 78, Mandi Yard C',
              itemCount: 8,
              qrCode: 'PICKUP-ORD-2024-002-VND-789',
              isPickedUp: true
            }
          ],
          allVendorsReady: true,
          routeOptimized: false,
          pickupTime: '10:30 AM'
        },
        {
          id: 3,
          orderId: 103,
          orderNumber: 'ORD-2024-003',
          status: 'InTransit',
          pickupAddress: 'Single Vendor',
          deliveryAddress: 'Cafe 456, Paldi, Ahmedabad',
          pickupContact: '+91 98765 43214',
          deliveryContact: '+91 98765 43215',
          distance: '18 km',
          estimatedTime: '28 mins',
          items: 3,
          priority: 'Normal',
          totalWeight: 25,
          totalVolume: 0.08,
          vehicleRequired: 'E-Rickshaw',
          basePayment: 200,
          fuelSurcharge: 24,
          totalEarning: 224,
          vendors: [
            {
              vendorId: 'vnd-234',
              name: 'Farm Fresh',
              address: 'Shop 23, Mandi Yard A',
              itemCount: 3,
              qrCode: 'PICKUP-ORD-2024-003-VND-234',
              isPickedUp: true
            }
          ],
          allVendorsReady: true,
          routeOptimized: false,
          pickupTime: '09:15 AM'
        },
        {
          id: 4,
          orderId: 104,
          orderNumber: 'ORD-2024-004',
          status: 'Delivered',
          pickupAddress: 'Mandi Yard A, Sector 23, Gandhinagar',
          deliveryAddress: 'Restaurant DEF, Vastrapur, Ahmedabad',
          pickupContact: '+91 98765 43216',
          deliveryContact: '+91 98765 43217',
          distance: '20 km',
          estimatedTime: '32 mins',
          items: 6,
          priority: 'Low',
          pickupTime: '08:00 AM',
          deliveryTime: '08:35 AM',
          totalWeight: 30,
          totalVolume: 0.5,
          vehicleRequired: 'Mini-Truck',
          basePayment: 250,
          fuelSurcharge: 30,
          totalEarning: 280,
          vendors: [],
          allVendorsReady: true,
          routeOptimized: true
        }
      ];
      
      this.filteredDeliveries = this.deliveries;
      this.loading = false;
    }, 1000);
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    
    if (status === 'all') {
      this.filteredDeliveries = this.deliveries;
    } else {
      this.filteredDeliveries = this.deliveries.filter(d => d.status === status);
    }
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'Pending': 'warning',
      'PickedUp': 'primary',
      'InTransit': 'secondary',
      'Delivered': 'success'
    };
    return colors[status] || 'medium';
  }

  getPriorityColor(priority: string): string {
    const colors: any = {
      'High': 'danger',
      'Normal': 'primary',
      'Low': 'medium'
    };
    return colors[priority] || 'medium';
  }

  viewOnMap(delivery: Delivery) {
    this.router.navigate(['/transporter/map'], {
      queryParams: { deliveryId: delivery.id }
    });
  }

  scanQR(delivery: Delivery) {
    this.router.navigate(['/transporter/scan'], {
      queryParams: { 
        deliveryId: delivery.id,
        orderNumber: delivery.orderNumber
      }
    });
  }
  
  async confirmLoading(delivery: Delivery) {
    const allPickedUp = delivery.vendors?.every(v => v.isPickedUp) ?? false;
    
    if (!allPickedUp) {
      alert('Please scan QR codes at all vendor stops first');
      return;
    }
    
    const confirmed = confirm(`Confirm all items loaded and ready to start journey?`);
    
    if (confirmed) {
      delivery.status = 'InTransit';
      alert('Journey started!');
      this.viewOnMap(delivery);
    }
  }
  
  acceptDelivery(delivery: Delivery) {
    if (!delivery.allVendorsReady) {
      alert('Waiting for all vendors to mark items ready...');
      return;
    }
    
    delivery.status = 'Pending';
    alert(`Delivery accepted! ${delivery.vendors.length} pickup stops on route.`);
  }
  
  startNavigation(delivery: Delivery) {
    this.viewOnMap(delivery);
  }

  callContact(phone: string) {
    window.open(`tel:${phone}`, '_system');
  }

  allVendorsPickedUp(delivery: Delivery): boolean {
    return delivery.vendors && delivery.vendors.length > 0 
      ? delivery.vendors.every(v => v.isPickedUp) 
      : false;
  }

  doRefresh(event: any) {
    this.loadDeliveries();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
