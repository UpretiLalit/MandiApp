import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { OrderService } from '@app/core/services/order.service';
// Uncomment when barcode scanner is installed:
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

interface VendorPickup {
  vendorId: string;
  stallNumber: string;
  vendorName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
  }>;
  qrCode: string;
  isScanned: boolean;
  scannedAt?: Date;
}

interface ActiveTrip {
  orderId: number;
  orderNumber: string;
  pickupLocation: string;
  dropLocation: string;
  distance: number;
  totalWeight: number;
  earning: number;
  vendors: VendorPickup[];
  status: 'pickup' | 'delivering' | 'delivered';
}

@Component({
  selector: 'app-active-trip',
  templateUrl: './active-trip.page.html',
  styleUrls: ['./active-trip.page.scss'],
})
export class ActiveTripPage implements OnInit {
  trip: ActiveTrip | null = null;
  loading: boolean = true;
  
  // Mock mode toggle
  useMockScanner: boolean = true; // Set to false to use real camera scanner

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.loadTripDetails(+orderId);
    }
  }

  loadTripDetails(orderId: number) {
    this.loading = true;
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.trip = {
        orderId: orderId,
        orderNumber: 'ORD-2026-001',
        pickupLocation: 'Azadpur Mandi',
        dropLocation: 'Khanna Grocery Store, Patel Nagar',
        distance: 4.2,
        totalWeight: 300,
        earning: 350,
        status: 'pickup',
        vendors: [
          {
            vendorId: 'vendor-001',
            stallNumber: 'Stall 42',
            vendorName: 'Fresh Farms',
            items: [
              { productName: 'Tomatoes', quantity: 10, unit: 'kg' },
              { productName: 'Onions', quantity: 15, unit: 'kg' }
            ],
            qrCode: 'PICKUP-ORD-2026-001-VND-001',
            isScanned: false
          },
          {
            vendorId: 'vendor-002',
            stallNumber: 'Stall 109',
            vendorName: 'Veggie World',
            items: [
              { productName: 'Potatoes', quantity: 20, unit: 'kg' }
            ],
            qrCode: 'PICKUP-ORD-2026-001-VND-002',
            isScanned: false
          },
          {
            vendorId: 'vendor-003',
            stallNumber: 'Stall 15',
            vendorName: 'Green Valley',
            items: [
              { productName: 'Carrots', quantity: 8, unit: 'kg' },
              { productName: 'Cabbage', quantity: 12, unit: 'kg' }
            ],
            qrCode: 'PICKUP-ORD-2026-001-VND-003',
            isScanned: false
          }
        ]
      };
      
      this.loading = false;
    }, 1000);
  }

  scanVendorQR(vendor: VendorPickup) {
    if (this.useMockScanner) {
      // Mock mode - simulate scan
      console.log('Mock scanning for vendor:', vendor.stallNumber);
      this.handleSuccessfulScan(vendor, vendor.qrCode);
      return;
    }
    
    // Real QR scanner
    this.startRealQRScan(vendor);
  }

  async startRealQRScan(vendor: VendorPickup) {
    // TODO: Install @capacitor-community/barcode-scanner first
    // Run: npm install @capacitor-community/barcode-scanner
    //      npx cap sync
    
    const alert = await this.alertController.create({
      header: 'Scanner Not Installed',
      message: 'Please install the barcode scanner plugin. See QR_SCANNER_SETUP.md for instructions.',
      buttons: ['OK']
    });
    await alert.present();
    return;
    
    /* Uncomment when plugin is installed:
    try {
      // Check camera permission
      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (!status.granted) {
        // Show permission required alert
        const alert = await this.alertController.create({
          header: 'Camera Permission Required',
          message: 'Please allow camera access to scan QR codes.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }

      // Hide background to show camera
      document.body.classList.add('scanner-active');
      
      // Start scanning
      const result = await BarcodeScanner.startScan();
      
      // Show background again
      document.body.classList.remove('scanner-active');

      if (result.hasContent) {
        console.log('Scanned QR code:', result.content);
        
        // Verify QR code matches expected vendor
        if (this.verifyQRCode(result.content, vendor)) {
          this.handleSuccessfulScan(vendor, result.content);
        } else {
          this.showErrorToast('Wrong QR code! Please scan the correct vendor stall.');
        }
      }
    } catch (error) {
      console.error('QR scan error:', error);
      document.body.classList.remove('scanner-active');
      this.showErrorToast('Failed to scan QR code. Please try again.');
    }
    */
  }

  verifyQRCode(scannedCode: string, vendor: VendorPickup): boolean {
    // Check if scanned code matches vendor's QR code
    // You can customize this logic based on your QR code format
    return scannedCode === vendor.qrCode || scannedCode.includes(vendor.vendorId);
  }

  handleSuccessfulScan(vendor: VendorPickup, qrCode: string) {
    // Simulate processing delay
    setTimeout(() => {
      vendor.isScanned = true;
      vendor.scannedAt = new Date();
      
      const toast = document.createElement('ion-toast');
      toast.message = `✅ ${vendor.stallNumber} scanned successfully!`;
      toast.duration = 2000;
      toast.color = 'success';
      document.body.appendChild(toast);
      toast.present();
    }, 500);
  }

  showErrorToast(message: string) {
    const toast = document.createElement('ion-toast');
    toast.message = '❌ ' + message;
    toast.duration = 3000;
    toast.color = 'danger';
    document.body.appendChild(toast);
    toast.present();
  }

  async stopScanner() {
    // Uncomment when plugin is installed:
    // await BarcodeScanner.stopScan();
    document.body.classList.remove('scanner-active');
  }

  get allVendorsScanned(): boolean {
    return this.trip?.vendors.every(v => v.isScanned) ?? false;
  }

  get scannedCount(): number {
    return this.trip?.vendors.filter(v => v.isScanned).length ?? 0;
  }

  startDelivery() {
    if (!this.allVendorsScanned || !this.trip) return;

    const toast = document.createElement('ion-toast');
    toast.message = '🚚 Starting delivery to buyer location...';
    toast.duration = 2500;
    toast.color = 'primary';
    document.body.appendChild(toast);
    toast.present();

    // Update trip status
    this.trip.status = 'delivering';

    // Navigate to delivery page or show route
    setTimeout(() => {
      this.router.navigate(['/transporter/delivering', this.trip?.orderId]);
    }, 2500);
  }

  callVendor(vendor: VendorPickup) {
    console.log('Calling vendor:', vendor.vendorName);
    // window.open(`tel:${vendor.phone}`, '_system');
  }

  viewMap() {
    console.log('Open map view with vendor locations');
    // Navigate to map page or open in-app map
  }

  cancelTrip() {
    // Show confirmation and cancel trip
    console.log('Cancel trip');
  }
}
