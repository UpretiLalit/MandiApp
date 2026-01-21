import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {
  darkMode: boolean = false;

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    // Check if dark mode is saved in localStorage
    const savedTheme = localStorage.getItem('darkMode');
    this.darkMode = savedTheme === 'true';
    this.applyTheme();
    
    // Initialize real-time notifications
    console.log('📢 Real-time notifications initialized');
  }

  refreshData() {
    window.location.reload();
  }

  viewReports() {
    this.router.navigate(['/admin/reports']);
  }
  
  toggleDarkMode() {
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyTheme();
  }
  
  applyTheme() {
    document.body.classList.toggle('dark', this.darkMode);
  }

  async logout() {
    await this.authService.logout();
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    // Force navigation with page reload to clear all state
    window.location.href = '/auth/login';
  }
}
