import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { OrderService } from '@core/services/order.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userRole: string = '';
  userName: string = '';
  
  // Buyer Stats
  newProductsCount: number = 0;
  cartItemsCount: number = 0;
  activeOrdersCount: number = 0;
  totalOrders: number = 0;
  totalSpent: number = 0;
  favoriteVendors: number = 0;
  
  // Vendor Stats
  productsCount: number = 0;
  pendingOrdersCount: number = 0;
  totalSales: number = 0;
  totalRevenue: number = 0;
  vendorRating: number = 0;
  
  // Transporter Stats
  activeDeliveriesCount: number = 0;
  completedDeliveries: number = 0;
  totalEarnings: number = 0;
  transporterRating: number = 0;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    public router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userRole = user.role;
      this.userName = user.fullName;
      this.loadDashboardStats();
    }
  }

  loadDashboardStats() {
    switch (this.userRole) {
      case 'Buyer':
        this.loadBuyerStats();
        break;
      case 'Vendor':
        this.loadVendorStats();
        break;
      case 'Transporter':
        this.loadTransporterStats();
        break;
    }
  }

  loadBuyerStats() {
    // Load cart count
    this.orderService.getCart().subscribe({
      next: (cart) => {
        this.cartItemsCount = cart.cartItems?.length || 0;
      },
      error: (error) => console.error('Error loading cart:', error)
    });
    
    // Mock data for now - replace with actual API calls
    this.newProductsCount = 12;
    this.activeOrdersCount = 3;
    this.totalOrders = 45;
    this.totalSpent = 15680;
    this.favoriteVendors = 8;
  }

  loadVendorStats() {
    // Mock data - replace with actual API calls
    this.productsCount = 24;
    this.pendingOrdersCount = 7;
    this.totalSales = 156;
    this.totalRevenue = 45300;
    this.vendorRating = 4.5;
  }

  loadTransporterStats() {
    // Mock data - replace with actual API calls
    this.activeDeliveriesCount = 5;
    this.completedDeliveries = 89;
    this.totalEarnings = 12450;
    this.transporterRating = 4.8;
  }

  getRoleIcon(): string {
    switch (this.userRole) {
      case 'Buyer': return 'basket';
      case 'Vendor': return 'storefront';
      case 'Transporter': return 'car-sport';
      default: return 'person';
    }
  }

  getRoleDescription(): string {
    switch (this.userRole) {
      case 'Buyer': return 'Browse fresh products and manage your orders';
      case 'Vendor': return 'Manage your inventory and track sales';
      case 'Transporter': return 'Manage deliveries and track earnings';
      default: return 'Mandi App Dashboard';
    }
  }

  async logout() {
    await this.authService.logout();
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
    window.location.href = '/auth/login';
  }
}
