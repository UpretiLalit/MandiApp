import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

interface PricingTier {
  minQuantity: number;
  price: number;
}

@Component({
  selector: 'app-quick-update',
  templateUrl: './quick-update.page.html',
  styleUrls: ['./quick-update.page.scss'],
})
export class QuickUpdatePage implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  filterStatus: string = 'all';
  updatedPrices: { [key: number]: number } = {};
  updatedStock: { [key: number]: number } = {};

  constructor(
    private productService: ProductService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    const loading = await this.loadingController.create({
      message: 'Loading products...'
    });
    await loading.present();

    // Load from backend vendor-inventory endpoint
    this.http.get<any[]>(`${environment.orderingApiUrl}/products/vendor-inventory`).subscribe({
      next: (products) => {
        this.products = products.map(p => ({
          ...p,
          currentPrice: p.price || p.currentPrice || 0,
          availableQuantity: p.stockQuantity || p.availableQuantity || 0,
          grade: p.grade || 'A',
          isActive: p.isActive !== false,
          hasSmartPricing: p.hasSmartPricing || false,
          pricingTiers: p.pricingTiers || [],
          tiersExpanded: false  // Initially collapsed
        }));
        
        // Initialize values with plain objects
        this.products.forEach(p => {
          this.updatedPrices[p.id] = p.currentPrice;
          this.updatedStock[p.id] = p.availableQuantity;
        });
        
        this.filterProducts();
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        loading.dismiss();
        this.showToast('Failed to load products', 'danger');
      }
    });
  }

  filterProducts() {
    if (this.filterStatus === 'active') {
      this.filteredProducts = this.products.filter(p => p.isActive);
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  adjustPrice(product: any, amount: number) {
    this.updatedPrices[product.id] = Math.max(10, this.updatedPrices[product.id] + amount);
  }

  adjustStock(product: any, amount: number) {
    this.updatedStock[product.id] = Math.max(0, this.updatedStock[product.id] + amount);
  }

  onPriceInputChange(product: any) {
    if (this.updatedPrices[product.id] < 10) {
      this.updatedPrices[product.id] = 10;
    }
  }

  onStockInputChange(product: any) {
    if (this.updatedStock[product.id] < 0) {
      this.updatedStock[product.id] = 0;
    }
  }

  addTier(product: any) {
    if (!product.pricingTiers) {
      product.pricingTiers = [];
    }
    
    // Calculate default values
    const lastTier = product.pricingTiers.length > 0 
      ? product.pricingTiers[product.pricingTiers.length - 1] 
      : null;
    
    const newMinQty = lastTier ? lastTier.minQuantity + 10 : 10;
    const newPrice = lastTier 
      ? Math.round(lastTier.price * 0.95) 
      : Math.round(this.updatedPrices[product.id] * 0.95);
    
    product.pricingTiers.push({
      minQuantity: newMinQty,
      price: newPrice
    });
    
    // Don't auto-save, let user adjust values first
  }

  removeTier(product: any, index: number) {
    if (product.pricingTiers && product.pricingTiers.length > index) {
      product.pricingTiers.splice(index, 1);
      // Don't auto-save, let user make more changes
    }
  }

  onTierChange(product: any) {
    // Validate and sort tiers
    if (product.pricingTiers) {
      product.pricingTiers.forEach((tier: any) => {
        tier.minQuantity = Math.max(1, tier.minQuantity || 1);
        tier.price = Math.max(0, tier.price || 0);
      });
      
      // Sort by minQuantity
      product.pricingTiers.sort((a: any, b: any) => a.minQuantity - b.minQuantity);
    }
  }

  getFirstTierMin(product: any): number {
    if (product.pricingTiers && product.pricingTiers.length > 0) {
      return product.pricingTiers[0].minQuantity;
    }
    return 999;
  }

  toggleTiersExpanded(product: any) {
    product.tiersExpanded = !product.tiersExpanded;
  }
  
  toggleSmartPricing(product: any) {
    if (product.hasSmartPricing) {
      // Initialize with empty tiers array, vendor will add tiers
      product.pricingTiers = [];
      product.tiersExpanded = true; // Auto-expand when enabled
    } else {
      // Clear tiers when disabled
      product.pricingTiers = [];
      product.tiersExpanded = false;
    }
    // Don't auto-save, let user add tiers first
  }

  onToggleActive(product: any) {
    this.saveProduct(product, false); // Don't collapse on toggle
  }

  async saveProduct(product: any, forceCollapse = true) {
    const newPrice = this.updatedPrices[product.id];
    const newStock = this.updatedStock[product.id];
    
    // Show loading
    const loading = await this.loadingController.create({
      message: 'Saving...',
      duration: 3000
    });
    await loading.present();
    
    // Send to backend with smart pricing tiers
    this.http.put(`${environment.orderingApiUrl}/products/${product.id}`, {
      price: newPrice,
      stockQuantity: newStock,
      isActive: product.isActive,
      hasSmartPricing: product.hasSmartPricing,
      pricingTiers: product.hasSmartPricing ? product.pricingTiers : []
    }).subscribe({
      next: () => {
        loading.dismiss();
        
        // Update local values to reflect changes
        product.currentPrice = newPrice;
        product.availableQuantity = newStock;
        
        // Collapse tiers after save
        if (forceCollapse && product.hasSmartPricing) {
          product.tiersExpanded = false;
        }
        
        // Show success notification
        this.showToast(`✅ ${product.name} updated successfully! Price: ₹${newPrice}`, 'success');
      },
      error: (err) => {
        loading.dismiss();
        console.error('Save error:', err);
        this.showToast(`❌ Failed to save ${product.name}. Please try again.`, 'danger');
      }
    });
  }

  hasProductChanged(product: any): boolean {
    return this.updatedPrices[product.id] !== product.currentPrice ||
           this.updatedStock[product.id] !== product.availableQuantity;
  }

  hasChanges(): boolean {
    return this.products.some(p => this.hasProductChanged(p));
  }

  getChangesCount(): number {
    return this.products.filter(p => this.hasProductChanged(p)).length;
  }

  async saveAllChanges() {
    const loading = await this.loadingController.create({
      message: 'Saving all changes...',
      duration: 500
    });
    await loading.present();

    const changedProducts = this.products.filter(p => this.hasProductChanged(p));
    
    // Save all changed products with pricing tiers to backend
    const savePromises = changedProducts.map(p => 
      this.http.put(`${environment.orderingApiUrl}/products/${p.id}`, {
        price: this.updatedPrices[p.id],
        stockQuantity: this.updatedStock[p.id],
        isActive: p.isActive,
        hasSmartPricing: p.hasSmartPricing,
        pricingTiers: p.hasSmartPricing ? p.pricingTiers : []
      }).toPromise()
    );
    
    Promise.all(savePromises).then(() => {
      // Update local values
      this.products.forEach(p => {
        p.currentPrice = this.updatedPrices[p.id];
        p.availableQuantity = this.updatedStock[p.id];
      });
      
      loading.dismiss();
      
      const toast = this.toastController.create({
        message: `${changedProducts.length} products updated with smart pricing`,
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      toast.then(t => t.present());
    }).catch(err => {
      console.error('Bulk save error:', err);
      loading.dismiss();
      
      const toast = this.toastController.create({
        message: 'Some products failed to save',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      toast.then(t => t.present());
    });
  }

  getCurrentPrice(product: any): number {
    return this.updatedPrices[product.id] || product.currentPrice;
  }

  getBulkPrice(product: any, quantity: number): number {
    if (!product.hasSmartPricing || !product.pricingTiers || product.pricingTiers.length === 0) {
      return this.getCurrentPrice(product);
    }
    
    // Find the applicable tier based on quantity
    let applicablePrice = this.getCurrentPrice(product);
    for (const tier of product.pricingTiers) {
      if (quantity >= tier.minQuantity) {
        applicablePrice = tier.price;
      } else {
        break; // Tiers are sorted, so we can break early
      }
    }
    
    return applicablePrice;
  }

  toggleBulkPricing(product: any) {
    // Could expand to show detailed modal
  }

  onPriceChange(product: any, event: any) {
    const newPrice = event.detail.value;
    this.updatedPrices[product.id] = newPrice;
  }

  onStockChange(product: any, event: any) {
    const newStock = event.detail.value;
    this.updatedStock[product.id] = newStock;
  }

  // Quick price adjustments
  quickAdjustPrice(product: any, percentage: number) {
    const currentPrice = product.currentPrice;
    const newPrice = Math.round(currentPrice * (1 + percentage / 100));
    this.updatedPrices[product.id] = newPrice;
  }

  async updatePrice(product: any) {
    const newPrice = this.updatedPrices[product.id];
    const newStock = this.updatedStock[product.id];
    
    if (newPrice === product.currentPrice && newStock === product.availableQuantity) {
      this.showToast('No changes to update', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Updating...',
      duration: 300
    });
    await loading.present();

    // Simulate API call - update both price and stock
    setTimeout(() => {
      if (newPrice !== product.currentPrice) {
        product.currentPrice = newPrice!;
      }
      if (newStock !== product.availableQuantity) {
        product.availableQuantity = newStock!;
      }
      
      const changes = [];
      if (newPrice !== product.currentPrice) changes.push(`Price: ₹${newPrice}`);
      if (newStock !== product.availableQuantity) changes.push(`Stock: ${newStock}`);
      
      this.showToast(`✓ ${product.name} updated!`, 'success');
      loading.dismiss();
    }, 300);
  }

  async toggleStock(product: any) {
    product.isActive = !product.isActive;
    this.showToast(
      product.isActive ? `${product.name} is now active` : `${product.name} is now inactive`,
      'success'
    );
  }

  getMinPrice(currentPrice: number): number {
    return Math.max(1, Math.floor(currentPrice * 0.5));
  }

  getMaxPrice(currentPrice: number): number {
    return Math.ceil(currentPrice * 2);
  }

  getPriceChange(product: any): number {
    const newPrice = this.updatedPrices[product.id] || product.currentPrice;
    return ((newPrice - product.currentPrice) / product.currentPrice) * 100;
  }
  
  getStockChange(product: any): number {
    const newStock = this.updatedStock[product.id] || product.availableQuantity;
    return newStock - product.availableQuantity;
  }
  
  getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return 'success';
      case 'B': return 'warning';
      case 'C': return 'danger';
      default: return 'medium';
    }
  }

  getActiveProductsCount(): number {
    return this.products.filter(p => p.isActive).length;
  }

  async addNewProduct() {
    const toast = await this.toastController.create({
      message: 'Add product feature - Coming soon! Products are loaded from backend.',
      duration: 2000,
      position: 'bottom',
      color: 'primary'
    });
    toast.present();
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
}
