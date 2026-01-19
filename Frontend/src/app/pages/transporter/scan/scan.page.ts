import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {
  scanType: 'pickup' | 'delivery' = 'pickup';
  scannedData: string = '';
  lastScannedQR: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  ngOnInit() {}

  async scanQRCode() {
    try {
      // Request camera permissions
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      // In a real app, you would use a QR scanner library to decode the image
      // For demo purposes, we'll simulate a QR code scan
      await this.simulateQRScan();
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.showToast('Failed to access camera', 'danger');
    }
  }

  async simulateQRScan() {
    const loading = await this.loadingController.create({
      message: 'Scanning QR Code...',
      duration: 1000
    });
    await loading.present();

    // Simulate QR code data
    setTimeout(async () => {
      loading.dismiss();
      
      // Generate mock QR data
      const mockQRData = `QR-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
      this.scannedData = mockQRData;
      this.lastScannedQR = mockQRData;
      
      await this.processQRCode(mockQRData);
    }, 1000);
  }

  async processQRCode(qrData: string) {
    if (this.scanType === 'pickup') {
      await this.confirmPickup(qrData);
    } else {
      await this.confirmDelivery(qrData);
    }
  }

  async confirmPickup(qrData: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Pickup',
      message: `Scan QR: ${qrData}`,
      subHeader: 'Mark this order as picked up?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm Pickup',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Confirming pickup...'
            });
            await loading.present();

            // Update delivery status to PickedUp
            // This would call your backend API
            setTimeout(() => {
              loading.dismiss();
              this.showToast('Pickup confirmed successfully', 'success');
              this.router.navigate(['/transporter/map']);
            }, 1000);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDelivery(qrData: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delivery',
      message: `Scan QR: ${qrData}`,
      subHeader: 'Mark this order as delivered?',
      cssClass: 'delivery-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Complete Delivery',
          handler: async () => {
            await this.completeDelivery(qrData);
          }
        }
      ]
    });

    await alert.present();
  }

  async completeDelivery(qrCode: string) {
    const loading = await this.loadingController.create({
      message: 'Completing delivery...'
    });
    await loading.present();

    // Call API to confirm delivery
    this.http.post(`${environment.logisticsHubUrl}/api/delivery/confirm-delivery`, {
      deliveryId: 1, // This should be the actual delivery ID
      qrCode: qrCode
    }).subscribe({
      next: () => {
        loading.dismiss();
        this.showSuccessMessage();
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error confirming delivery:', error);
        this.showToast('Failed to confirm delivery', 'danger');
      }
    });
  }

  async showSuccessMessage() {
    const alert = await this.alertController.create({
      header: '✓ Delivery Complete!',
      message: 'Payment released to vendor',
      cssClass: 'success-alert',
      buttons: [
        {
          text: 'View Next Delivery',
          handler: () => {
            this.router.navigate(['/transporter/deliveries']);
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  manualEntry() {
    this.alertController.create({
      header: 'Enter QR Code',
      inputs: [
        {
          name: 'qrCode',
          type: 'text',
          placeholder: 'QR-XXXXXXXXXXXX'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit',
          handler: (data) => {
            if (data.qrCode) {
              this.processQRCode(data.qrCode);
            }
          }
        }
      ]
    }).then(alert => alert.present());
  }
}
