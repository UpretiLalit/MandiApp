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
    switch (this.userRole) {
      case 'Buyer':
        this.router.navigate(['/marketplace']);
        break;
      case 'Vendor':
        this.router.navigate(['/vendor']);
        break;
      case 'Transporter':
        this.router.navigate(['/transporter']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
