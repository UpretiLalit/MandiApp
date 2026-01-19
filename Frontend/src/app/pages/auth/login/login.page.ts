import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  phoneForm!: FormGroup;
  otpForm!: FormGroup;
  
  step: 'phone' | 'otp' = 'phone';
  phoneNumber: string = '';
  countdown: number = 60;
  countdownInterval: any;
  canResend: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.phoneForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  async sendOtp() {
    if (this.phoneForm.invalid) {
      this.showError('Please enter a valid 10-digit mobile number');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Sending OTP...',
    });
    await loading.present();

    const phone = this.phoneForm.value.phone;
    this.phoneNumber = phone;

    // Development bypass - use OTP 123456 for any number
    console.log('DEVELOPMENT MODE: Use OTP 123456 for phone', phone);
    loading.dismiss();
    this.step = 'otp';
    this.startCountdown();
    this.showSuccess('OTP sent! Use: 123456');

    /* Original API call - uncomment when backend is ready
    this.authService.sendOtp({ phoneNumber: phone }).subscribe({
      next: () => {
        loading.dismiss();
        this.step = 'otp';
        this.startCountdown();
        this.showSuccess('OTP sent successfully');
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error sending OTP:', error);
        this.showError('Failed to send OTP. Please try again.');
      }
    });
    */
  }

  async verifyOtp() {
    if (this.otpForm.invalid) {
      this.showError('Please enter a valid 6-digit OTP');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Verifying OTP...',
    });
    await loading.present();

    const otp = this.otpForm.value.otp;

    // Development bypass - accept 123456 as valid OTP
    if (otp === '123456') {
      loading.dismiss();
      console.log('DEVELOPMENT MODE: Login successful for', this.phoneNumber);
      
      // Mock user data based on phone number
      const mockUser = {
        id: '1',
        fullName: this.phoneNumber.startsWith('98765432') ? 'Restaurant ABC' : 'Test User',
        phoneNumber: this.phoneNumber,
        email: 'test@example.com',
        role: this.phoneNumber.endsWith('10') ? 'Buyer' as const : 
              this.phoneNumber.endsWith('11') || this.phoneNumber.endsWith('12') ? 'Vendor' as const : 
              this.phoneNumber.endsWith('13') ? 'Transporter' as const : 'Buyer' as const
      };
      
      // Save mock auth data
      await this.authService['saveAuthData']('mock-token-' + Date.now(), mockUser);
      
      this.router.navigate(['/home']);
      return;
    }

    /* Original API call - uncomment when backend is ready
    this.authService.verifyOtp({ phoneNumber: this.phoneNumber, otp }).subscribe({
      next: () => {
        loading.dismiss();
        this.router.navigate(['/home']);
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error verifying OTP:', error);
        
        if (error.status === 404) {
          // User not found - redirect to registration
          this.showRegisterPrompt();
        } else {
          this.showError('Invalid OTP. Please try again.');
        }
      }
    });
    */

    loading.dismiss();
    this.showError('Invalid OTP. Please use 123456 for development.');
  }

  async showRegisterPrompt() {
    const alert = await this.alertController.create({
      header: 'Account Not Found',
      message: 'No account found with this number. Would you like to register?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Register',
          handler: () => {
            this.router.navigate(['/auth/register'], {
              queryParams: { phone: this.phoneNumber, otp: this.otpForm.value.otp }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  startCountdown() {
    this.countdown = 60;
    this.canResend = false;
    
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  resendOtp() {
    if (!this.canResend) return;
    
    this.otpForm.reset();
    this.sendOtp();
  }

  goBack() {
    if (this.step === 'otp') {
      this.step = 'phone';
      this.otpForm.reset();
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  async showSuccess(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      cssClass: 'success-toast',
      position: 'top'
    });
    await toast.present();
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
