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
  
  // Mock user database for dev mode
  private mockUsers = [
    { id: 'mock-vendor-1', phoneNumber: '8287433082', role: 'Vendor' as 'Buyer' | 'Vendor' | 'Transporter' | 'Admin', fullName: 'Test Vendor', email: 'vendor@test.com' },
    { id: 'mock-buyer-1', phoneNumber: '9876543210', role: 'Buyer' as 'Buyer' | 'Vendor' | 'Transporter' | 'Admin', fullName: 'Test Buyer', email: 'buyer@test.com' },
    { id: 'mock-transporter-1', phoneNumber: '9876543211', role: 'Transporter' as 'Buyer' | 'Vendor' | 'Transporter' | 'Admin', fullName: 'Test Transporter', email: 'transporter@test.com' }
  ];
  
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

    // For non-admin users, check if already registered
    const loading = await this.loadingController.create({
      message: 'Checking registration...',
      spinner: 'crescent'
    });
    await loading.present();

    // TODO: Check backend if user is registered
    // For now, simulate: if ends with even number = registered, odd = new user
    const lastDigit = parseInt(phone.charAt(phone.length - 1));
    const isRegistered = lastDigit % 2 === 0;

    if (isRegistered) {
      // Auto-login for registered users
      console.log('USER REGISTERED: Auto-login for', phone);
      loading.dismiss();
      await this.autoLogin(phone);
    } else {
      // Send OTP for new user registration
      console.log('NEW USER: Sending OTP for registration');
      loading.dismiss();
      this.step = 'otp';
      this.startCountdown();
      this.initOtpAutoRead();
      this.showSuccess('Welcome! OTP sent for registration. Use: 123456');
    }

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

  async autoLogin(phone: string) {
    const loading = await this.loadingController.create({
      message: 'Logging in...',
    });
    await loading.present();

    // Simulate API call to get user data
    setTimeout(async () => {
      // Mock user data - in real app, get from backend
      const mockUser = {
        id: 'user-' + phone,
        fullName: 'User ' + phone.slice(-4),
        phoneNumber: phone,
        email: `user${phone.slice(-4)}@mandi.app`,
        role: 'Buyer' as 'Buyer' | 'Vendor' | 'Transporter' | 'Admin'
      };

      await this.authService['saveAuthData']('mock-token-' + Date.now(), mockUser);
      loading.dismiss();
      this.showSuccess('Welcome back!');
      
      // Redirect based on user role from backend
      setTimeout(() => {
        this.router.navigate(['/marketplace']);
      }, 500);
    }, 1000);
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
      
      if (this.isAdminPhone) {
        // Admin login
        console.log('ADMIN LOGIN SUCCESSFUL');
        
        const adminUser = {
          id: 'admin-001',
          fullName: 'System Administrator',
          phoneNumber: this.ADMIN_PHONE,
          email: 'admin@mandi.app',
          role: 'Admin' as 'Buyer' | 'Vendor' | 'Transporter' | 'Admin'
        };
        
        await this.authService['saveAuthData']('mock-admin-token-' + Date.now(), adminUser);
        this.showSuccess('Welcome Admin!');
        
        setTimeout(() => {
          this.router.navigate(['/admin/verification']);
        }, 500);
      } else {
        // Check mock database first for dev mode
        console.log('🔍 LOGIN ATTEMPT FOR:', this.phoneNumber);
        let existingUser = this.mockUsers.find((u: any) => u.phoneNumber === this.phoneNumber);
        console.log('📱 Found in mockUsers:', existingUser);
        
        // If not in mock db, check localStorage (for newly registered users)
        if (!existingUser) {
          const storedUsers = localStorage.getItem('registered_users');
          console.log('💾 localStorage registered_users:', storedUsers);
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          console.log('👥 Parsed users:', users);
          existingUser = users.find((u: any) => u.phoneNumber === this.phoneNumber);
          console.log('✅ Found user in localStorage:', existingUser);
        }
        
        if (existingUser) {
          // Existing user - redirect based on role
          console.log('🎭 USER ROLE:', existingUser.role);
          console.log('👤 FULL USER DATA:', JSON.stringify(existingUser, null, 2));
          
          await this.authService['saveAuthData']('mock-token-' + Date.now(), existingUser);
          this.showSuccess('Welcome back!');
          
          let redirectPath = '/marketplace';
          if (existingUser.role === 'Vendor') {
            redirectPath = '/vendor/products';
            console.log('🏪 VENDOR DETECTED - Redirecting to:', redirectPath);
          } else if (existingUser.role === 'Transporter') {
            redirectPath = '/transporter/dashboard';
            console.log('🚚 TRANSPORTER DETECTED - Redirecting to:', redirectPath);
          } else if (existingUser.role === 'Admin') {
            redirectPath = '/admin';
            console.log('👑 ADMIN DETECTED - Redirecting to:', redirectPath);
          } else {
            console.log('🛒 BUYER/DEFAULT - Redirecting to:', redirectPath);
          }
          
          console.log('🚀 FINAL REDIRECT PATH:', redirectPath);
          setTimeout(() => {
            this.router.navigate([redirectPath]);
          }, 300);
        } else {
          // User not found in either mockUsers or localStorage
          // This could be a user created through admin before localStorage integration
          // Create a basic Buyer account for them to use temporarily
          console.log('⚠️ USER NOT FOUND - Creating temporary Buyer account for', this.phoneNumber);
          
          const tempUser = {
            id: 'temp-' + Date.now(),
            phoneNumber: this.phoneNumber,
            fullName: 'User ' + this.phoneNumber,
            role: 'Buyer' as 'Buyer' | 'Vendor' | 'Transporter' | 'Admin',
            email: `${this.phoneNumber}@mandi.app`,
            createdAt: new Date().toISOString()
          };
          
          // Save to localStorage so they don't have to register again
          const storedUsers = localStorage.getItem('registered_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          users.push(tempUser);
          localStorage.setItem('registered_users', JSON.stringify(users));
          console.log('✅ Temporary Buyer account created and saved');
          
          // Save auth data
          await this.authService['saveAuthData']('mock-token-' + Date.now(), tempUser);
          
          // Show message
          this.showSuccess('Welcome! Redirecting to marketplace...');
          
          setTimeout(() => {
            this.router.navigate(['/marketplace']);
          }, 300);
        }
      }
      return;
    }

    // Real API call for production
    this.authService.verifyOtp({ phoneNumber: this.phoneNumber, otp }).subscribe({
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
        const userRole = response.user?.role || 'Buyer';
        let redirectPath = '/marketplace';
        
        if (userRole === 'Vendor') {
          redirectPath = '/vendor/products';
        } else if (userRole === 'Transporter') {
          redirectPath = '/transporter/dashboard';
        } else if (userRole === 'Admin') {
          redirectPath = '/admin';
        } else if (userRole === 'Buyer') {
          redirectPath = '/marketplace';
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
