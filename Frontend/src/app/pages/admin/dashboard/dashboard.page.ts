import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    // Redirect to hubs page as main admin interface
    this.router.navigate(['/admin/hubs']);
  }

}
