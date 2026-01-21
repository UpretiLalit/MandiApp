import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userRole: string = '';
  userName: string = '';

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userRole = user.role;
      this.userName = user.fullName;
      this.navigateBasedOnRole();
    }
  }

  navigateBasedOnRole() {
    console.log('🏠 HOME PAGE navigateBasedOnRole() called for role:', this.userRole);
    switch (this.userRole) {
      case 'Buyer':
        console.log('🛒 HOME: Redirecting Buyer to /marketplace');
        this.router.navigate(['/marketplace']);
        break;
      case 'Vendor':
        console.log('🏪 HOME: Redirecting Vendor to /vendor/products');
        this.router.navigate(['/vendor/products']);
        break;
      case 'Transporter':
        console.log('🚚 HOME: Redirecting Transporter to /transporter/dashboard');
        this.router.navigate(['/transporter/dashboard']);
        break;
      default:
        console.log('❌ HOME: No role, redirecting to login');
        this.router.navigate(['/auth/login']);
    }
  }

  async logout() {
    await this.authService.logout();
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    // Replace URL to prevent back navigation
    this.router.navigate(['/auth/login'], { replaceUrl: true });
    // Force reload to clear any cached state
    window.location.href = '/auth/login';
  }
}
