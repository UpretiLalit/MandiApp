import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

interface ProofData {
  deliveryId: number;
  orderNumber: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
  signature?: string;
  notes: string;
  timestamp: Date;
}

@Component({
  selector: 'app-proof',
  templateUrl: './proof.page.html',
  styleUrls: ['./proof.page.scss'],
})
export class ProofPage implements OnInit {
  @ViewChild('signatureCanvas', { static: false }) signatureCanvas?: ElementRef<HTMLCanvasElement>;
  
  deliveryId?: number;
  orderNumber?: string;
  proofData: ProofData = {
    deliveryId: 0,
    orderNumber: '',
    notes: '',
    timestamp: new Date()
  };
  
  isDrawing = false;
  signatureContext?: CanvasRenderingContext2D;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.deliveryId = parseInt(this.route.snapshot.queryParamMap.get('deliveryId') || '0');
    this.orderNumber = this.route.snapshot.queryParamMap.get('orderNumber') || '';
    
    this.proofData.deliveryId = this.deliveryId;
    this.proofData.orderNumber = this.orderNumber;
  }

  async takePickupPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      this.proofData.pickupPhoto = image.dataUrl;
    } catch (error) {
      console.error('Error taking pickup photo:', error);
      this.showError('Failed to capture photo');
    }
  }

  async takeDeliveryPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      this.proofData.deliveryPhoto = image.dataUrl;
    } catch (error) {
      console.error('Error taking delivery photo:', error);
      this.showError('Failed to capture photo');
    }
  }

  removePhoto(type: 'pickup' | 'delivery') {
    if (type === 'pickup') {
      this.proofData.pickupPhoto = undefined;
    } else {
      this.proofData.deliveryPhoto = undefined;
    }
  }

  initializeSignature() {
    setTimeout(() => {
      if (this.signatureCanvas) {
        const canvas = this.signatureCanvas.nativeElement;
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;
        
        this.signatureContext = canvas.getContext('2d')!;
        this.signatureContext.strokeStyle = '#000';
        this.signatureContext.lineWidth = 2;
        this.signatureContext.lineCap = 'round';
      }
    }, 100);
  }

  startDrawing(event: any) {
    if (!this.signatureContext) return;
    
    this.isDrawing = true;
    const rect = this.signatureCanvas!.nativeElement.getBoundingClientRect();
    const x = event.touches ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = event.touches ? event.touches[0].clientY - rect.top : event.clientY - rect.top;
    
    this.signatureContext.beginPath();
    this.signatureContext.moveTo(x, y);
  }

  draw(event: any) {
    if (!this.isDrawing || !this.signatureContext) return;
    
    event.preventDefault();
    const rect = this.signatureCanvas!.nativeElement.getBoundingClientRect();
    const x = event.touches ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = event.touches ? event.touches[0].clientY - rect.top : event.clientY - rect.top;
    
    this.signatureContext.lineTo(x, y);
    this.signatureContext.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    if (this.signatureCanvas) {
      this.proofData.signature = this.signatureCanvas.nativeElement.toDataURL();
    }
  }

  clearSignature() {
    if (this.signatureContext && this.signatureCanvas) {
      const canvas = this.signatureCanvas.nativeElement;
      this.signatureContext.clearRect(0, 0, canvas.width, canvas.height);
      this.proofData.signature = undefined;
    }
  }

  async submitProof() {
    // Validation
    if (!this.proofData.pickupPhoto) {
      this.showError('Please take a pickup photo');
      return;
    }
    
    if (!this.proofData.deliveryPhoto) {
      this.showError('Please take a delivery photo');
      return;
    }
    
    if (!this.proofData.signature) {
      this.showError('Please provide a signature');
      return;
    }
    
    const loading = await this.loadingController.create({
      message: 'Submitting proof of delivery...'
    });
    await loading.present();
    
    try {
      // Submit to backend
      await this.http.post('/api/logistics/proof', {
        deliveryId: this.proofData.deliveryId,
        pickupPhoto: this.proofData.pickupPhoto,
        deliveryPhoto: this.proofData.deliveryPhoto,
        signature: this.proofData.signature,
        notes: this.proofData.notes,
        timestamp: this.proofData.timestamp
      }).toPromise();
      
      loading.dismiss();
      
      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Proof of delivery submitted successfully!',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.router.navigate(['/transporter/deliveries']);
            }
          }
        ]
      });
      await alert.present();
      
    } catch (error) {
      console.error('Error submitting proof:', error);
      loading.dismiss();
      this.showError('Failed to submit proof');
    }
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  cancel() {
    this.router.navigate(['/transporter/deliveries']);
  }
}
