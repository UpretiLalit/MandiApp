import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

// Interfaces
interface VerificationDocument {
  id: string;
  type: 'governmentId' | 'stallLicense' | 'drivingLicense' | 'vehicleInsurance';
  documentNumber: string;
  documentUrl: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface PendingUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: 'Vendor' | 'Transporter';
  registeredAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  
  // KYC Documents
  documents: VerificationDocument[];
  
  // Vendor specific
  businessName?: string;
  stallNumber?: string;
  mandiLocation?: string;
  
  // Transporter specific
  vehicleType?: string;
  vehicleNumber?: string;
  vehicleCapacity?: string;
}

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
})
export class VerificationPage implements OnInit {
  pendingUsers: PendingUser[] = [];
  filteredUsers: PendingUser[] = [];
  selectedTab: 'all' | 'vendor' | 'transporter' = 'all';
  selectedNavTab: string = 'verification'; // Navigation tab
  searchQuery: string = '';
  useMockData: boolean = true; // Toggle for mock vs real API

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPendingUsers();
  }

  loadPendingUsers() {
    if (this.useMockData) {
      this.pendingUsers = [
        {
          id: 'vendor-pending-001',
          fullName: 'Rajesh Kumar',
          phoneNumber: '+91 98765 43210',
          email: 'rajesh@example.com',
          role: 'Vendor',
          businessName: 'Fresh Farms',
          stallNumber: 'A-42',
          mandiLocation: 'Azadpur Mandi, Delhi',
          registeredAt: new Date('2026-01-18T10:30:00'),
          status: 'pending',
          documents: [
            {
              id: 'doc-001',
              type: 'governmentId',
              documentNumber: 'ABCDE1234F',
              documentUrl: 'https://picsum.photos/400/300?random=1',
              uploadedAt: new Date('2026-01-18T10:35:00'),
              status: 'pending'
            },
            {
              id: 'doc-002',
              type: 'stallLicense',
              documentNumber: 'SL-AZD-2026-042',
              documentUrl: 'https://picsum.photos/400/300?random=2',
              uploadedAt: new Date('2026-01-18T10:36:00'),
              status: 'pending'
            }
          ]
        },
        {
          id: 'transporter-pending-001',
          fullName: 'Amit Singh',
          phoneNumber: '+91 99887 76655',
          email: 'amit.transport@example.com',
          role: 'Transporter',
          vehicleType: 'Tempo (Mini Truck)',
          vehicleNumber: 'DL-1234-5678',
          vehicleCapacity: '500 kg',
          registeredAt: new Date('2026-01-19T14:20:00'),
          status: 'pending',
          documents: [
            {
              id: 'doc-003',
              type: 'governmentId',
              documentNumber: 'FGHIJ5678K',
              documentUrl: 'https://picsum.photos/400/300?random=3',
              uploadedAt: new Date('2026-01-19T14:25:00'),
              status: 'pending'
            },
            {
              id: 'doc-004',
              type: 'drivingLicense',
              documentNumber: 'DL-0120260012345',
              documentUrl: 'https://picsum.photos/400/300?random=4',
              uploadedAt: new Date('2026-01-19T14:26:00'),
              status: 'pending'
            },
            {
              id: 'doc-005',
              type: 'vehicleInsurance',
              documentNumber: 'INS-2026-DL1234',
              documentUrl: 'https://picsum.photos/400/300?random=5',
              uploadedAt: new Date('2026-01-19T14:27:00'),
              status: 'pending'
            }
          ]
        },
        {
          id: 'vendor-pending-002',
          fullName: 'Priya Sharma',
          phoneNumber: '+91 87654 32109',
          email: 'priya@example.com',
          role: 'Vendor',
          businessName: 'Organic Veggies',
          stallNumber: 'B-15',
          mandiLocation: 'Mumbai APMC',
          registeredAt: new Date('2026-01-20T09:15:00'),
          status: 'pending',
          documents: [
            {
              id: 'doc-006',
              type: 'governmentId',
              documentNumber: 'LMNOP9876Q',
              documentUrl: 'https://picsum.photos/400/300?random=6',
              uploadedAt: new Date('2026-01-20T09:20:00'),
              status: 'pending'
            },
            {
              id: 'doc-007',
              type: 'stallLicense',
              documentNumber: 'SL-MUM-2026-015',
              documentUrl: 'https://picsum.photos/400/300?random=7',
              uploadedAt: new Date('2026-01-20T09:21:00'),
              status: 'pending'
            }
          ]
        }
      ];
      this.filterUsers();
    } else {
      // TODO: Call real API
      // this.verificationService.getPendingUsers().subscribe(...)
    }
  }

  filterUsers() {
    let filtered = this.pendingUsers;

    // Filter by role
    if (this.selectedTab !== 'all') {
      filtered = filtered.filter(user => 
        user.role.toLowerCase() === this.selectedTab
      );
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(query) ||
        user.phoneNumber.includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.businessName && user.businessName.toLowerCase().includes(query)) ||
        (user.vehicleNumber && user.vehicleNumber.toLowerCase().includes(query))
      );
    }

    this.filteredUsers = filtered;
  }

  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
    this.filterUsers();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.filterUsers();
  }

  navigateToTab(event: any) {
    const tab = event.detail.value;
    if (tab === 'users') {
      this.router.navigate(['/admin/users']);
    } else if (tab === 'hubs') {
      this.router.navigate(['/admin/hubs']);
    } else if (tab === 'marketplace') {
      this.router.navigate(['/admin/marketplace']);
    }
  }

  async viewDocument(doc: VerificationDocument) {
    const alert = await this.alertController.create({
      header: this.getDocumentTitle(doc.type),
      message: `
        <div style="text-align: center;">
          <img src="${doc.documentUrl}" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" />
          <p><strong>Document Number:</strong> ${doc.documentNumber}</p>
          <p><strong>Uploaded:</strong> ${new Date(doc.uploadedAt).toLocaleDateString()}</p>
        </div>
      `,
      cssClass: 'document-preview-alert',
      buttons: ['Close']
    });
    await alert.present();
  }

  async approveUser(user: PendingUser) {
    const alert = await this.alertController.create({
      header: 'Approve User',
      message: `Are you sure you want to approve <strong>${user.fullName}</strong> as a ${user.role}? They will receive a welcome notification and can start using the platform.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Approve',
          cssClass: 'success-button',
          handler: async () => {
            await this.performApproval(user);
          }
        }
      ]
    });
    await alert.present();
  }

  async performApproval(user: PendingUser) {
    if (this.useMockData) {
      // Mock approval
      user.status = 'approved';
      user.documents.forEach(doc => doc.status = 'approved');
      
      // Remove from pending list
      this.pendingUsers = this.pendingUsers.filter(u => u.id !== user.id);
      this.filterUsers();
      
      // Show success notification
      const toast = await this.toastController.create({
        message: `✅ ${user.fullName} approved! Welcome SMS sent.`,
        duration: 3000,
        position: 'top',
        color: 'success',
        icon: 'checkmark-circle'
      });
      await toast.present();
      
      // Simulate SMS/Push notification
      console.log(`📱 SMS Sent to ${user.phoneNumber}: "Welcome to Mandi App! Your account has been approved."`);
    } else {
      // TODO: Call real API
      // this.verificationService.approveUser(user.id).subscribe(...)
    }
  }

  async rejectUser(user: PendingUser) {
    const alert = await this.alertController.create({
      header: 'Reject Application',
      message: `Why are you rejecting <strong>${user.fullName}</strong>?`,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Enter rejection reason (optional)',
          attributes: {
            rows: 3
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reject',
          cssClass: 'danger-button',
          handler: async (data) => {
            await this.performRejection(user, data.reason);
          }
        }
      ]
    });
    await alert.present();
  }

  async performRejection(user: PendingUser, reason: string) {
    if (this.useMockData) {
      // Mock rejection
      user.status = 'rejected';
      
      // Remove from pending list
      this.pendingUsers = this.pendingUsers.filter(u => u.id !== user.id);
      this.filterUsers();
      
      // Show notification
      const toast = await this.toastController.create({
        message: `❌ ${user.fullName}'s application rejected.`,
        duration: 3000,
        position: 'top',
        color: 'warning',
        icon: 'close-circle'
      });
      await toast.present();
      
      // Simulate SMS notification
      const reasonText = reason ? ` Reason: ${reason}` : '';
      console.log(`📱 SMS Sent to ${user.phoneNumber}: "Your Mandi App application was not approved.${reasonText}"`);
    } else {
      // TODO: Call real API
      // this.verificationService.rejectUser(user.id, reason).subscribe(...)
    }
  }

  getDocumentTitle(type: string): string {
    const titles: Record<string, string> = {
      governmentId: 'Government ID (Aadhaar/PAN)',
      stallLicense: 'Stall License',
      drivingLicense: 'Driving License',
      vehicleInsurance: 'Vehicle Insurance'
    };
    return titles[type] || type;
  }

  getDocumentIcon(type: string): string {
    const icons: Record<string, string> = {
      governmentId: 'card-outline',
      stallLicense: 'document-text-outline',
      drivingLicense: 'car-outline',
      vehicleInsurance: 'shield-checkmark-outline'
    };
    return icons[type] || 'document-outline';
  }

  getPendingCount(role: 'all' | 'vendor' | 'transporter'): number {
    if (role === 'all') {
      return this.pendingUsers.length;
    }
    return this.pendingUsers.filter(u => u.role.toLowerCase() === role).length;
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }
}
