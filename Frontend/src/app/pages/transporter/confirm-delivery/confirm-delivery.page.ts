import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

interface DeliveryConfirmation {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerQRCode: string;
  deliveryAddress: string;
  earning: number;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

@Component({
  selector: 'app-confirm-delivery',
  templateUrl: './confirm-delivery.page.html',
  styleUrls: ['./confirm-delivery.page.scss'],
})
export class ConfirmDeliveryPage implements OnInit {
  orderId: string = '';
  delivery: DeliveryConfirmation | null = null;
  
  deliveryConfirmed: boolean = false;
  isScanning: boolean = false;
  
  // Mock mode toggle
  useMockScanner: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || '';
    this.loadDeliveryDetails();
  }

  loadDeliveryDetails() {
    // TODO: Replace with actual API call
    // const response = await this.orderService.getDeliveryConfirmation(this.orderId);
    
    // Mock data
    this.delivery = {
      orderId: this.orderId,
      orderNumber: 'ORD-2026-001',
      buyerName: 'Rajesh Kumar',
      buyerPhone: '+91 98765 43210',
      buyerQRCode: 'DELIVERY-ORD-2026-001-BUYER',
      deliveryAddress: '123, Green Market, Sector 18, Delhi - 110001',
      earning: 350,
      items: [
        { productName: 'Fresh Tomatoes', quantity: 10 },
        { productName: 'Red Onions', quantity: 5 },
        { productName: 'Potatoes', quantity: 8 },
        { productName: 'Carrots', quantity: 6 },
        { productName: 'Cabbage', quantity: 4 }
      ]
    };
  }

  async scanBuyerQR() {
    if (this.useMockScanner) {
      // Mock mode - simulate successful scan
      console.log('Mock scanning buyer QR code');
      await this.simulateScan();
      return;
    }
    
    // Real QR scanner (commented out until plugin installed)
    this.startRealQRScan();
  }

  async simulateScan() {
    this.isScanning = true;
    
    // Show scanning feedback
    const toast = document.createElement('ion-toast');
    toast.message = '📸 Scanning buyer QR code...';
    toast.duration = 1500;
    toast.color = 'primary';
    document.body.appendChild(toast);
    toast.present();
    
    // Simulate scan delay
    setTimeout(() => {
      this.isScanning = false;
      this.confirmDelivery(this.delivery!.buyerQRCode);
    }, 2000);
  }

  async startRealQRScan() {
    // TODO: Implement real scanner when plugin is installed
    const alert = await this.alertController.create({
      header: 'Scanner Not Installed',
      message: 'Please install the barcode scanner plugin first.',
      buttons: ['OK']
    });
    await alert.present();
    
    /* Uncomment when plugin is installed:
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (!status.granted) {
        const alert = await this.alertController.create({
          header: 'Camera Permission Required',
          message: 'Please allow camera access to scan buyer QR code.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }

      this.isScanning = true;
      document.body.classList.add('scanner-active');
      
      const result = await BarcodeScanner.startScan();
      
      document.body.classList.remove('scanner-active');
      this.isScanning = false;

      if (result.hasContent) {
        if (this.verifyBuyerQR(result.content)) {
          this.confirmDelivery(result.content);
        } else {
          this.showErrorToast('Invalid QR code! Please scan the buyer\'s delivery QR.');
        }
      }
    } catch (error) {
      console.error('QR scan error:', error);
      document.body.classList.remove('scanner-active');
      this.isScanning = false;
      this.showErrorToast('Failed to scan QR code. Please try again.');
    }
    */
  }

  verifyBuyerQR(scannedCode: string): boolean {
    // Verify the scanned code matches the expected buyer QR
    return scannedCode === this.delivery!.buyerQRCode || 
           scannedCode.includes(this.delivery!.orderId);
  }

  async confirmDelivery(qrCode: string) {
    // TODO: Call backend API to confirm delivery
    // await this.orderService.confirmDelivery(this.orderId, qrCode);
    
    console.log('Delivery confirmed with QR:', qrCode);
    
    // Show success animation
    this.deliveryConfirmed = true;
    
    // Play success sound/haptic feedback
    this.playSuccessFeedback();
    
    // Show success toast
    setTimeout(() => {
      const toast = document.createElement('ion-toast');
      toast.message = `✅ Delivery confirmed! ₹${this.delivery!.earning} added to wallet.`;
      toast.duration = 3000;
      toast.color = 'success';
      toast.position = 'top';
      document.body.appendChild(toast);
      toast.present();
    }, 1000);
  }

  playSuccessFeedback() {
    // In real app: play success sound and haptic feedback
    console.log('🎉 Success feedback triggered!');
  }

  showErrorToast(message: string) {
    const toast = document.createElement('ion-toast');
    toast.message = '❌ ' + message;
    toast.duration = 3000;
    toast.color = 'danger';
    document.body.appendChild(toast);
    toast.present();
  }

  async callBuyer() {
    const alert = await this.alertController.create({
      header: 'Call Buyer',
      message: `Do you want to call ${this.delivery?.buyerName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Call',
          handler: () => {
            window.open(`tel:${this.delivery?.buyerPhone}`, '_system');
          }
        }
      ]
    });
    await alert.present();
  }

  returnToMandi() {
    // Navigate back to dashboard for next job
    this.router.navigate(['/transporter/dashboard']);
  }

  viewEarnings() {
    // Navigate to earnings/wallet page
    console.log('Navigate to earnings page');
    // this.router.navigate(['/transporter/earnings']);
  }
}
