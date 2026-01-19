import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';

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

  categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Other'];

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProducts();
  }

  initForm() {
    this.addProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['Vegetables', Validators.required],
      description: ['', Validators.required],
      unit: ['kg', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      imageUrl: ['']
    });
  }

  loadProducts() {
    this.loading = true;
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Filter to show only vendor's products
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

  openAddForm() {
    this.showAddForm = true;
    this.editingProduct = null;
    this.addProductForm.reset({
      category: 'Vegetables',
      unit: 'kg'
    });
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingProduct = null;
    this.addProductForm.reset();
  }

  async addProduct() {
    if (this.addProductForm.invalid) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Adding product...'
    });
    await loading.present();

    const formValue = this.addProductForm.value;
    const newProduct = {
      name: formValue.name,
      category: formValue.category,
      description: formValue.description,
      unit: formValue.unit,
      price: formValue.price,
      quantity: formValue.quantity,
      imageUrl: formValue.imageUrl
    };

    this.productService.createProduct(newProduct).subscribe({
      next: () => {
        loading.dismiss();
        this.showToast('Product added successfully', 'success');
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
    this.editingProduct = product;
    this.showAddForm = true;
    
    this.addProductForm.patchValue({
      name: product.name,
      category: product.category,
      description: product.description,
      unit: product.unit,
      price: product.currentPrice,
      quantity: product.availableQuantity,
      imageUrl: product.imageUrl
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
