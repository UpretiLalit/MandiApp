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
      companyName: formValue.companyName || null,
      gstNumber: formValue.gstNumber || null
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        loading.dismiss();
        this.showSuccessAndNavigate();
      },
      error: (error) => {
        loading.dismiss();
        console.error('Registration error:', error);
        this.showError('Registration failed. Please try again.');
      }
    });
  }

  async showSuccessAndNavigate() {
    const alert = await this.alertController.create({
      header: 'Success!',
      message: 'Your account has been created successfully',
      buttons: [
        {
          text: 'Continue',
          handler: () => {
            this.router.navigate(['/home']);
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
