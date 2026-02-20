import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';
  
  showAddForm: boolean = false;
  addProductForm!: FormGroup;
  editingProduct: Product | null = null;
  detectedEmoji: string = '';
  currentLanguage: string = 'en';
  priceTiers: Array<{minQty: number, maxQty: number, price: number}> = [];
  showCustomProductName: boolean = false;
  
  // Master product list (from admin)
  masterProductList: string[] = [
    'Tomatoes', 'टमाटर',
    'Onions', 'प्याज',
    'Potatoes', 'आलू',
    'Carrots', 'गाजर',
    'Spinach', 'पालक',
    'Cabbage', 'पत्तागोभी',
    'Cauliflower', 'फूलगोभी',
    'Apples', 'सेब',
    'Bananas', 'केला',
    'Mangoes', 'आम',
    'Oranges', 'संतरा',
    'Grapes', 'अंगूर',
    'Rice', 'चावल',
    'Wheat', 'गेहूं',
    'Corn', 'मक्का',
    'Milk', 'दूध',
    'Paneer', 'पनीर',
    'Turmeric', 'हल्दी',
    'Chili', 'मिर्च',
    'Pepper', 'काली मिर्च'
  ];

  categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Other'];
  
  // Product name translations
  productTranslations: {[key: string]: {[lang: string]: string}} = {
    'Tomatoes': { hi: 'टमाटर', en: 'Tomatoes' },
    'Tomato': { hi: 'टमाटर', en: 'Tomato' },
    'Onions': { hi: 'प्याज', en: 'Onions' },
    'Onion': { hi: 'प्याज', en: 'Onion' },
    'Potatoes': { hi: 'आलू', en: 'Potatoes' },
    'Potato': { hi: 'आलू', en: 'Potato' },
    'Carrots': { hi: 'गाजर', en: 'Carrots' },
    'Carrot': { hi: 'गाजर', en: 'Carrot' },
    'Spinach': { hi: 'पालक', en: 'Spinach' },
    'Cabbage': { hi: 'पत्तागोभी', en: 'Cabbage' },
    'Cauliflower': { hi: 'फूलगोभी', en: 'Cauliflower' },
    'Apples': { hi: 'सेब', en: 'Apples' },
    'Apple': { hi: 'सेब', en: 'Apple' },
    'Bananas': { hi: 'केला', en: 'Bananas' },
    'Banana': { hi: 'केला', en: 'Banana' },
    'Mangoes': { hi: 'आम', en: 'Mangoes' },
    'Mango': { hi: 'आम', en: 'Mango' },
    'Oranges': { hi: 'संतरा', en: 'Oranges' },
    'Orange': { hi: 'संतरा', en: 'Orange' },
    'Grapes': { hi: 'अंगूर', en: 'Grapes' },
    'Grape': { hi: 'अंगूर', en: 'Grape' },
    'Rice': { hi: 'चावल', en: 'Rice' },
    'Wheat': { hi: 'गेहूं', en: 'Wheat' },
    'Corn': { hi: 'मक्का', en: 'Corn' },
    'Milk': { hi: 'दूध', en: 'Milk' },
    'Paneer': { hi: 'पनीर', en: 'Paneer' },
    'Turmeric': { hi: 'हल्दी', en: 'Turmeric' },
    'Chili': { hi: 'मिर्च', en: 'Chili' },
    'Pepper': { hi: 'काली मिर्च', en: 'Pepper' }
  };
  
  // Emoji mapping for products
  emojiMap: {[key: string]: string} = {
    'Tomatoes': '🍅', 'Tomato': '🍅', 'टमाटर': '🍅',
    'Onions': '🧅', 'Onion': '🧅', 'प्याज': '🧅',
    'Potatoes': '🥔', 'Potato': '🥔', 'आलू': '🥔',
    'Carrots': '🥕', 'Carrot': '🥕', 'गाजर': '🥕',
    'Spinach': '🥬', 'पालक': '🥬',
    'Cabbage': '🥬', 'पत्तागोभी': '🥬',
    'Cauliflower': '🥦', 'फूलगोभी': '🥦',
    'Apples': '🍎', 'Apple': '🍎', 'सेब': '🍎',
    'Bananas': '🍌', 'Banana': '🍌', 'केला': '🍌',
    'Mangoes': '🥭', 'Mango': '🥭', 'आम': '🥭',
    'Oranges': '🍊', 'Orange': '🍊', 'संतरा': '🍊',
    'Grapes': '🍇', 'Grape': '🍇', 'अंगूर': '🍇',
    'Rice': '🌾', 'चावल': '🌾',
    'Wheat': '🌾', 'गेहूं': '🌾',
    'Corn': '🌽', 'मक्का': '🌽',
    'Milk': '🥛', 'दूध': '🥛',
    'Paneer': '🧈', 'पनीर': '🧈',
    'Turmeric': '🌿', 'हल्दी': '🌿',
    'Chili': '🌶️', 'मिर्च': '🌶️',
    'Pepper': '🫑', 'काली मिर्च': '🫑'
  };

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProducts();
    
    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  initForm() {
    this.addProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      customName: [''],
      category: ['Vegetables', Validators.required],
      grade: ['', Validators.required], // Grade is REQUIRED
      description: ['', Validators.required],
      unit: ['kg', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      minOrderQty: ['', [Validators.required, Validators.min(1)]], // Minimum order quantity
      imageUrl: ['']
    });
  }

  async loadProducts() {
    this.loading = true;
    
    // Load from backend vendor-inventory endpoint for real-time data
    this.productService.getVendorInventory().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
        this.showToast('Failed to load products', 'danger');
      }
    });
  }

  applyFilters() {
    let filtered = this.products;

    // Filter by status
    if (this.filterStatus === 'active') {
      filtered = filtered.filter(p => p.isActive);
    } else if (this.filterStatus === 'inactive') {
      filtered = filtered.filter(p => !p.isActive);
    }

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredProducts = filtered;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  filterByStatus(status: 'all' | 'active' | 'inactive') {
    this.filterStatus = status;
    this.applyFilters();
  }

  async toggleStock(product: Product, event: any) {
    const newStatus = event.detail.checked;
    
    const loading = await this.loadingController.create({
      message: 'Updating stock status...',
      duration: 1000
    });
    await loading.present();

    // Call API to update stock status
    product.isActive = newStatus;
    
    setTimeout(() => {
      loading.dismiss();
      this.showToast(
        `${product.name} is now ${newStatus ? 'In Stock' : 'Out of Stock'}`,
        'success'
      );
    }, 500);
  }

  async quickToggleStatus(product: Product) {
    product.isActive = !product.isActive;
    this.showToast(
      `${product.name} is now ${product.isActive ? 'Active' : 'Inactive'}`,
      'success'
    );
  }

  openAddForm() {
    this.showAddForm = true;
    this.editingProduct = null;
    this.detectedEmoji = '';
    this.priceTiers = [];
    this.showCustomProductName = false;
    this.addProductForm.reset({
      category: 'Vegetables',
      unit: 'kg'
    });
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingProduct = null;
    this.detectedEmoji = '';
    this.addProductForm.reset();
  }
  
  onProductNameSelect(event: any) {
    const selectedValue = event.detail.value;
    if (selectedValue === '__custom__') {
      // Show custom product name input
      this.showCustomProductName = true;
      this.addProductForm.patchValue({ name: '' });
      this.addProductForm.get('customName')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.addProductForm.get('customName')?.updateValueAndValidity();
    } else {
      // Use selected product from master list
      this.showCustomProductName = false;
      this.addProductForm.get('customName')?.clearValidators();
      this.addProductForm.get('customName')?.updateValueAndValidity();
      this.detectEmoji(selectedValue);
    }
  }
  
  onProductNameChange(event: any) {
    const name = event.detail.value;
    if (name) {
      // Auto-detect emoji from custom product name
      this.detectEmoji(name);
    }
  }
  
  cancelCustomProduct() {
    this.showCustomProductName = false;
    this.addProductForm.patchValue({ name: '', customName: '' });
    this.addProductForm.get('customName')?.clearValidators();
    this.addProductForm.get('customName')?.updateValueAndValidity();
    this.detectedEmoji = '';
  }
  
  detectEmoji(productName: string) {
    // Try to find emoji for the product name
    const trimmedName = productName.trim();
    
    // Check direct match
    if (this.emojiMap[trimmedName]) {
      this.detectedEmoji = this.emojiMap[trimmedName];
      return;
    }
    
    // Check partial match (case insensitive)
    const lowerName = trimmedName.toLowerCase();
    for (const key in this.emojiMap) {
      if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
        this.detectedEmoji = this.emojiMap[key];
        return;
      }
    }
    
    // Default emoji
    this.detectedEmoji = '🥬';
  }
  
  getTranslatedProductName(englishName: string): string {
    if (this.currentLanguage === 'en') {
      return englishName;
    }
    return this.productTranslations[englishName]?.[this.currentLanguage] || englishName;
  }
  
  getTranslatedCategory(category: string): string {
    const categoryMap: {[key: string]: {[lang: string]: string}} = {
      'Vegetables': { hi: 'सब्जियां', en: 'Vegetables' },
      'Fruits': { hi: 'फल', en: 'Fruits' },
      'Grains': { hi: 'अनाज', en: 'Grains' },
      'Dairy': { hi: 'डेयरी', en: 'Dairy' },
      'Spices': { hi: 'मसाले', en: 'Spices' },
      'Other': { hi: 'अन्य', en: 'Other' }
    };
    return categoryMap[category]?.[this.currentLanguage] || category;
  }
  
  addPriceTier() {
    this.priceTiers.push({
      minQty: 0,
      maxQty: 0,
      price: 0
    });
  }
  
  removePriceTier(index: number) {
    this.priceTiers.splice(index, 1);
  }

  async addProduct() {
    if (this.addProductForm.invalid) {
      this.showToast('Please fill all required fields including grade', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Adding product...'
    });
    await loading.present();

    const formValue = this.addProductForm.value;
    
    // Use custom name if entered, otherwise use selected name from dropdown
    let productName = this.showCustomProductName ? formValue.customName : formValue.name;
    
    if (!productName) {
      this.showToast('Please select or enter a product name', 'warning');
      loading.dismiss();
      return;
    }
    
    const newProduct = {
      name: productName,
      category: formValue.category,
      grade: formValue.grade, // Include grade
      description: formValue.description,
      unit: formValue.unit,
      price: formValue.price,
      quantity: formValue.quantity,
      minOrderQty: formValue.minOrderQty, // Minimum order quantity
      imageUrl: formValue.imageUrl,
      emoji: this.detectedEmoji || '🥬',
      priceTiers: this.priceTiers.length > 0 ? this.priceTiers : undefined // Include tiered pricing if added
    };

    this.productService.createProduct(newProduct).subscribe({
      next: () => {
        loading.dismiss();
        this.showToast(`Product added successfully with Grade ${formValue.grade}`, 'success');
        this.closeAddForm();
        this.loadProducts();
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error adding product:', error);
        this.showToast('Failed to add product', 'danger');
      }
    });
  }

  async editProduct(product: Product) {
    // Navigate to quick-update page for fast editing
    this.router.navigate(['/quick-update'], {
      queryParams: { productId: product.id }
    });
  }

  async updateProduct() {
    if (this.addProductForm.invalid || !this.editingProduct) return;

    const loading = await this.loadingController.create({
      message: 'Updating product...'
    });
    await loading.present();

    // Call update API
    setTimeout(() => {
      loading.dismiss();
      this.showToast('Product updated successfully', 'success');
      this.closeAddForm();
      this.loadProducts();
    }, 1000);
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${product.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Deleting product...'
            });
            await loading.present();

            // Call delete API
            setTimeout(() => {
              loading.dismiss();
              this.showToast('Product deleted', 'success');
              this.loadProducts();
            }, 1000);
          }
        }
      ]
    });

    await alert.present();
  }

  goToQuickUpdate() {
    this.router.navigate(['/vendor/quick-update']);
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

  doRefresh(event: any) {
    this.loadProducts();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
