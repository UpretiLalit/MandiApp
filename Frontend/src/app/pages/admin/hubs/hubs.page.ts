import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';

interface Hub {
  id: string;
  name: string;
  localTimezone: string;
  baseCurrency: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  primaryLanguage: string;
  secondaryLanguage: string;
  isActive: boolean;
  createdAt: Date;
  vendorCount?: number;
  transporterCount?: number;
  dailyOrders?: number;
}

interface HubFormData {
  name: string;
  localTimezone: string;
  baseCurrency: string;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number;
  primaryLanguage: string;
  secondaryLanguage: string;
}

@Component({
  selector: 'app-hubs',
  templateUrl: './hubs.page.html',
  styleUrls: ['./hubs.page.scss'],
})
export class HubsPage implements OnInit {
  hubs: Hub[] = [];
  loading: boolean = true;
  showCreateForm: boolean = false;
  selectedTab: string = 'hubs'; // Navigation tab

  // Form data
  hubForm: HubFormData = {
    name: '',
    localTimezone: 'Asia/Kolkata',
    baseCurrency: 'INR',
    latitude: null,
    longitude: null,
    radiusKm: 5,
    primaryLanguage: 'en',
    secondaryLanguage: 'hi'
  };

  // Dropdown options
  timezones = [
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Dubai', label: 'UAE (GST)' },
    { value: 'America/New_York', label: 'US East (EST)' },
    { value: 'America/Los_Angeles', label: 'US West (PST)' },
    { value: 'Europe/London', label: 'UK (GMT)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
    { value: 'Australia/Sydney', label: 'Australia (AEDT)' }
  ];

  currencies = [
    { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
    { value: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
    { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ar', label: 'Arabic' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' }
  ];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadHubs();
  }

  navigateToTab(event: any) {
    const tab = event.detail.value;
    if (tab === 'verification') {
      this.router.navigate(['/admin/verification']);
    } else if (tab === 'users') {
      this.router.navigate(['/admin/users']);
    } else if (tab === 'marketplace') {
      this.router.navigate(['/admin/marketplace']);
    }
  }

  async loadHubs() {
    this.loading = true;
    
    // TODO: Replace with actual API call
    // const response = await this.hubService.getHubs();
    
    // Mock data
    setTimeout(() => {
      this.hubs = [
        {
          id: 'hub-001',
          name: 'Azadpur Mandi',
          localTimezone: 'Asia/Kolkata',
          baseCurrency: 'INR',
          latitude: 28.7041,
          longitude: 77.1025,
          radiusKm: 5,
          primaryLanguage: 'en',
          secondaryLanguage: 'hi',
          isActive: true,
          createdAt: new Date('2025-01-01'),
          vendorCount: 45,
          transporterCount: 12,
          dailyOrders: 150
        },
        {
          id: 'hub-002',
          name: 'Mumbai APMC',
          localTimezone: 'Asia/Kolkata',
          baseCurrency: 'INR',
          latitude: 19.0760,
          longitude: 72.8777,
          radiusKm: 8,
          primaryLanguage: 'en',
          secondaryLanguage: 'hi',
          isActive: true,
          createdAt: new Date('2025-02-15'),
          vendorCount: 32,
          transporterCount: 8,
          dailyOrders: 98
        }
      ];
      this.loading = false;
    }, 1000);
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.resetForm();
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.resetForm();
  }

  resetForm() {
    this.hubForm = {
      name: '',
      localTimezone: 'Asia/Kolkata',
      baseCurrency: 'INR',
      latitude: null,
      longitude: null,
      radiusKm: 5,
      primaryLanguage: 'en',
      secondaryLanguage: 'hi'
    };
  }

  async getCurrentLocation() {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.hubForm.latitude = parseFloat(position.coords.latitude.toFixed(6));
            this.hubForm.longitude = parseFloat(position.coords.longitude.toFixed(6));
            
            const toast = document.createElement('ion-toast');
            toast.message = '✅ Location captured successfully';
            toast.duration = 2000;
            toast.color = 'success';
            document.body.appendChild(toast);
            toast.present();
          },
          (error) => {
            console.error('Geolocation error:', error);
            this.showErrorToast('Failed to get current location. Please enter manually.');
          }
        );
      } else {
        this.showErrorToast('Geolocation is not supported by this browser.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      this.showErrorToast('Failed to access location services.');
    }
  }

  async createHub() {
    // Validation
    if (!this.hubForm.name || !this.hubForm.latitude || !this.hubForm.longitude) {
      this.showErrorToast('Please fill in all required fields');
      return;
    }

    if (this.hubForm.radiusKm < 1 || this.hubForm.radiusKm > 50) {
      this.showErrorToast('Radius must be between 1 and 50 km');
      return;
    }

    // TODO: Call backend API to create hub
    // const response = await this.hubService.createHub(this.hubForm);
    
    console.log('Creating hub:', this.hubForm);
    
    // Mock success
    const toast = document.createElement('ion-toast');
    toast.message = `✅ Hub "${this.hubForm.name}" created successfully!`;
    toast.duration = 3000;
    toast.color = 'success';
    document.body.appendChild(toast);
    toast.present();
    
    this.closeCreateForm();
    this.loadHubs();
  }

  async toggleHubStatus(hub: Hub) {
    const alert = await this.alertController.create({
      header: hub.isActive ? 'Deactivate Hub' : 'Activate Hub',
      message: hub.isActive 
        ? `Are you sure you want to deactivate "${hub.name}"? This will pause all operations.`
        : `Are you sure you want to activate "${hub.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: hub.isActive ? 'Deactivate' : 'Activate',
          handler: () => {
            // TODO: Call API to toggle status
            hub.isActive = !hub.isActive;
            
            const toast = document.createElement('ion-toast');
            toast.message = hub.isActive 
              ? `✅ Hub activated successfully`
              : `⏸️ Hub deactivated`;
            toast.duration = 2000;
            toast.color = hub.isActive ? 'success' : 'warning';
            document.body.appendChild(toast);
            toast.present();
          }
        }
      ]
    });
    await alert.present();
  }

  viewHubDetails(hub: Hub) {
    console.log('View hub details:', hub);
    // Navigate to hub details page
    // this.router.navigate(['/admin/hubs', hub.id]);
  }

  editHub(hub: Hub) {
    console.log('Edit hub:', hub);
    // Open edit form with hub data
    this.hubForm = {
      name: hub.name,
      localTimezone: hub.localTimezone,
      baseCurrency: hub.baseCurrency,
      latitude: hub.latitude,
      longitude: hub.longitude,
      radiusKm: hub.radiusKm,
      primaryLanguage: hub.primaryLanguage,
      secondaryLanguage: hub.secondaryLanguage
    };
    this.showCreateForm = true;
  }

  async deleteHub(hub: Hub) {
    const alert = await this.alertController.create({
      header: 'Delete Hub',
      message: `Are you sure you want to permanently delete "${hub.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          cssClass: 'alert-button-danger',
          handler: () => {
            // TODO: Call API to delete hub
            this.hubs = this.hubs.filter(h => h.id !== hub.id);
            
            const toast = document.createElement('ion-toast');
            toast.message = `🗑️ Hub "${hub.name}" deleted`;
            toast.duration = 2000;
            toast.color = 'danger';
            document.body.appendChild(toast);
            toast.present();
          }
        }
      ]
    });
    await alert.present();
  }

  showErrorToast(message: string) {
    const toast = document.createElement('ion-toast');
    toast.message = '❌ ' + message;
    toast.duration = 3000;
    toast.color = 'danger';
    document.body.appendChild(toast);
    toast.present();
  }

  getCurrencySymbol(code: string): string {
    return this.currencies.find(c => c.value === code)?.symbol || code;
  }

  getActiveHubsCount(): number {
    return this.hubs.filter(h => h.isActive).length;
  }

  getTotalVendors(): number {
    return this.hubs.reduce((sum, hub) => sum + (hub.vendorCount || 0), 0);
  }

  getTotalTransporters(): number {
    return this.hubs.reduce((sum, hub) => sum + (hub.transporterCount || 0), 0);
  }
}
