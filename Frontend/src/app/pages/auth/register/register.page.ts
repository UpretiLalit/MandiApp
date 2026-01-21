import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  phoneNumber: string = '';
  otp: string = '';
  
  roles = [
    { value: 'Buyer', label: 'Buyer', icon: 'cart-outline', description: 'Purchase fresh produce' },
    { value: 'Vendor', label: 'Vendor', icon: 'storefront-outline', description: 'Sell your products' },
    { value: 'Transporter', label: 'Transporter', icon: 'car-outline', description: 'Deliver orders' }
  ];

  languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get phone and OTP from query params if coming from login
    this.route.queryParams.subscribe(params => {
      if (params['phone']) {
        this.phoneNumber = params['phone'];
      }
      if (params['otp']) {
        this.otp = params['otp'];
      }
    });

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      role: ['', Validators.required],
      language: ['en', Validators.required],
      companyName: [''],
      gstNumber: ['', Validators.pattern(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/)],
      phone: [this.phoneNumber, [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      otp: [this.otp, [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Update validators when role changes
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const companyNameControl = this.registerForm.get('companyName');
      const gstNumberControl = this.registerForm.get('gstNumber');

      if (role === 'Vendor') {
        companyNameControl?.setValidators([Validators.required]);
        gstNumberControl?.setValidators([Validators.required, Validators.pattern(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/)]);
      } else {
        companyNameControl?.clearValidators();
        gstNumberControl?.clearValidators();
      }

      companyNameControl?.updateValueAndValidity();
      gstNumberControl?.updateValueAndValidity();
    });
  }

  selectRole(role: string) {
    this.registerForm.patchValue({ role });
  }

  async register() {
    if (this.registerForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creating your account...',
    });
    await loading.present();

    const formValue = this.registerForm.value;
    const registerData = {
      phoneNumber: formValue.phone,
      otp: formValue.otp,
      fullName: formValue.fullName,
      role: formValue.role,
      language: formValue.language || 'en',
      companyName: formValue.companyName || null,
      gstNumber: formValue.gstNumber || null
    };

    // Store language preference
    localStorage.setItem('app_language', formValue.language || 'en');

    // Store user locally for dev mode
    const newUser = {
      id: 'user-' + Date.now(),
      phoneNumber: formValue.phone,
      fullName: formValue.fullName,
      role: formValue.role,
      language: formValue.language || 'en',
      companyName: formValue.companyName || null,
      gstNumber: formValue.gstNumber || null,
      email: `${formValue.phone}@mandi.app`,
      createdAt: new Date().toISOString()
    };

    console.log('💾 REGISTERING NEW USER:', JSON.stringify(newUser, null, 2));

    // Store in localStorage for dev mode
    const storedUsers = localStorage.getItem('registered_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    console.log('✅ SAVED TO LOCALSTORAGE. Total users:', users.length);
    console.log('📋 ALL USERS:', JSON.stringify(users, null, 2));

    this.authService.register(registerData).subscribe({
      next: () => {
        loading.dismiss();
        this.showSuccessAndNavigate();
      },
      error: (error) => {
        loading.dismiss();
        console.error('Registration error:', error);
        // Even if backend fails, we stored locally, so proceed
        this.showSuccessAndNavigate();
        this.showError('Registration failed. Please try again.');
      }
    });
  }

  async showSuccessAndNavigate() {
    const role = this.registerForm.value.role;
    let redirectPath = '/marketplace';
    let message = 'Your account has been created successfully';

    // Redirect based on role
    if (role === 'Vendor') {
      redirectPath = '/vendor/products';
      message = 'Welcome Vendor! You can now start adding your products.';
    } else if (role === 'Transporter') {
      redirectPath = '/transporter/dashboard';
      message = 'Welcome Transporter! You can now view available delivery jobs.';
    } else if (role === 'Buyer') {
      redirectPath = '/marketplace';
      message = 'Welcome Buyer! You can now browse and order products.';
    } else if (role === 'Admin') {
      redirectPath = '/admin';
      message = 'Welcome Admin! Access your admin dashboard.';
    }

    const alert = await this.alertController.create({
      header: 'Success!',
      message: message,
      buttons: [
        {
          text: 'Continue',
          handler: () => {
            this.router.navigate([redirectPath]);
          }
        }
      ]
    });
    await alert.present();
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
