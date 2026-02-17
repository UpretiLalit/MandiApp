import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '@core/services/auth.service';

// WebOTP API interface
interface OTPCredential extends Credential {
  code: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  @ViewChild('otp1') otp1!: ElementRef;
  
  phoneForm!: FormGroup;
  otpForm!: FormGroup;
  
  step: 'phone' | 'otp' = 'phone';
  phoneNumber: string = '';
  countdown: number = 60;
  countdownInterval: any;
  canResend: boolean = false;
  isAdminPhone: boolean = false;
  readonly ADMIN_PHONE = '8287433081';
  
  // OTP digits for individual inputs
  otpDigits: string[] = ['', '', '', '', '', ''];
  otpAutoReadStatus: string = '';
  
  private abortController: AbortController | null = null;

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
  
  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.abortController) {
      this.abortController.abort();
    }
  }
  
  async sendOtp() {
    if (this.phoneForm.invalid) {
      this.showError('Please enter a valid 10-digit mobile number');
      return;
    }

    const phone = this.phoneForm.value.phone;
    this.phoneNumber = phone;
    this.isAdminPhone = phone === this.ADMIN_PHONE;

    // Check if it's admin phone - always send OTP
    if (this.isAdminPhone) {
      const loading = await this.loadingController.create({
        message: 'Sending OTP to Admin...',
        spinner: 'crescent'
      });
      await loading.present();

      console.log('ADMIN LOGIN: Use OTP 123456');
      loading.dismiss();
      this.step = 'otp';
      this.startCountdown();
      this.initOtpAutoRead();
      this.showSuccess('Admin OTP sent! Use: 123456');
      return;
    }

    // Send OTP via real API
    const loading = await this.loadingController.create({
      message: 'Sending OTP...',
      spinner: 'crescent'
    });
    await loading.present();

    // Always use real API - add +91 country code
    const phoneWithCountryCode = '+91' + phone;
    
    this.authService.sendOtp({ phoneNumber: phoneWithCountryCode }).subscribe({
      next: () => {
        loading.dismiss();
        this.step = 'otp';
        this.startCountdown();
        this.initOtpAutoRead();
        this.showSuccess('OTP sent successfully to ' + phoneWithCountryCode);
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error sending OTP:', error);
        
        // Provide specific error messages based on error status
        let errorMessage = 'Failed to send OTP. Please try again.';
        
        if (error.status === 500) {
          errorMessage = 'Server error. Our OTP service is temporarily unavailable. Please try again in a few minutes.';
        } else if (error.status === 429) {
          errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.status === 400) {
          errorMessage = 'Invalid phone number format. Please check and try again.';
        } else if (error.status === 0) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        this.showError(errorMessage);
      }
    });
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

    // Real API call - verify OTP with backend (add country code)
    const phoneWithCountryCode = '+91' + this.phoneNumber;
    this.authService.verifyOtp({ phoneNumber: phoneWithCountryCode, otp }).subscribe({
      next: (response: any) => {
        loading.dismiss();
        
        // Check if new user needs registration
        if (response.isNewUser) {
          this.router.navigate(['/auth/register'], {
            queryParams: {
              phone: this.phoneNumber,
              otp: otp
            }
          });
          return;
        }
        
        // Existing user - redirect based on role
        console.log('✅ LOGIN SUCCESSFUL! User:', response.user);
        const userRole = response.user?.role || 'Buyer';
        console.log('🎭 USER ROLE:', userRole);
        
        let redirectPath = '/marketplace';
        
        if (userRole === 'Vendor') {
          redirectPath = '/vendor/products';
          console.log('🏪 VENDOR - Redirecting to:', redirectPath);
        } else if (userRole === 'Transporter') {
          redirectPath = '/transporter/dashboard';
          console.log('🚚 TRANSPORTER - Redirecting to:', redirectPath);
        } else if (userRole === 'Admin') {
          redirectPath = '/admin/verification';
          console.log('👑 ADMIN - Redirecting to:', redirectPath);
        } else {
          console.log('🛒 BUYER - Redirecting to:', redirectPath);
        }
        
        this.showSuccess('Welcome back!');
        setTimeout(() => {
          this.router.navigate([redirectPath]);
        }, 300);
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error verifying OTP:', error);
        this.showError('Invalid OTP. Please try again.');
      }
    });
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
      this.otpDigits = ['', '', '', '', '', ''];
      this.otpAutoReadStatus = '';
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
      if (this.abortController) {
        this.abortController.abort();
      }
    } else {
      this.router.navigate(['/']);
    }
  }
  
  // OTP Auto-Read using WebOTP API
  async initOtpAutoRead() {
    // Check if WebOTP API is supported
    if ('OTPCredential' in window) {
      try {
        this.abortController = new AbortController();
        
        const otpCredential = await (navigator.credentials as any).get({
          otp: { transport: ['sms'] },
          signal: this.abortController.signal
        }) as OTPCredential;
        
        if (otpCredential && otpCredential.code) {
          console.log('✅ OTP Auto-Read:', otpCredential.code);
          this.otpAutoReadStatus = '✓ OTP detected automatically!';
          
          // Fill the OTP digits
          const code = otpCredential.code;
          for (let i = 0; i < 6 && i < code.length; i++) {
            this.otpDigits[i] = code[i];
          }
          
          // Update form value
          this.otpForm.patchValue({ otp: code });
          
          // Auto-verify after a short delay
          setTimeout(() => {
            if (this.isOtpComplete()) {
              this.verifyOtp();
            }
          }, 500);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('OTP auto-read aborted');
        } else {
          console.log('OTP auto-read not available:', error);
        }
      }
    } else {
      console.log('WebOTP API not supported on this device');
    }
  }
  
  // Handle OTP input for seamless digit entry
  onOtpInput(event: any, nextInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      input.value = '';
      return;
    }
    
    // Move to next input if value is entered
    if (value && nextInput) {
      setTimeout(() => nextInput.focus(), 10);
    }
    
    // Update OTP form value
    this.updateOtpFormValue();
  }
  
  // Handle backspace navigation
  onOtpKeydown(event: KeyboardEvent, previousInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    
    if (event.key === 'Backspace' && !input.value && previousInput) {
      setTimeout(() => previousInput.focus(), 10);
    }
  }
  
  // Update the combined OTP value
  updateOtpFormValue() {
    const otpValue = this.otpDigits.join('');
    this.otpForm.patchValue({ otp: otpValue });
  }
  
  // Check if all OTP digits are entered
  isOtpComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '') && this.otpDigits.join('').length === 6;
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
