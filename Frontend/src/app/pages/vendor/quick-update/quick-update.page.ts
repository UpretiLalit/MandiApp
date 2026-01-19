import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'app-quick-update',
  templateUrl: './quick-update.page.html',
  styleUrls: ['./quick-update.page.scss'],
})
export class QuickUpdatePage implements OnInit {
  products: Product[] = [];
  updatedPrices: Map<number, number> = new Map();

  constructor(
    private productService: ProductService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    const loading = await this.loadingController.create({
      message: 'Loading products...'
    });
    await loading.present();

    this.productService.getMyProducts().subscribe({
      next: (products) => {
        this.products = products.filter(p => p.isActive);
        // Initialize slider values
        products.forEach(p => {
          this.updatedPrices.set(p.id, p.currentPrice);
        });
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        loading.dismiss();
        this.showToast('Failed to load products', 'danger');
      }
    });
  }

  onPriceChange(product: Product, event: any) {
    const newPrice = event.detail.value;
    this.updatedPrices.set(product.id, newPrice);
  }

  async updatePrice(product: Product) {
    const newPrice = this.updatedPrices.get(product.id);
    if (!newPrice || newPrice === product.currentPrice) {
      this.showToast('No price change', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Updating price...',
      duration: 500
    });
    await loading.present();

    this.productService.updatePrice({
      productId: product.id,
      newPrice: newPrice
    }).subscribe({
      next: () => {
        product.currentPrice = newPrice;
        this.showToast(`${product.name} price updated to ₹${newPrice}`, 'success');
      },
      error: (error) => {
        console.error('Error updating price:', error);
        this.showToast('Failed to update price', 'danger');
      }
    });
  }

  async toggleStock(product: Product) {
    product.isActive = !product.isActive;
    // Here you would call an API to update the active status
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

  getPriceChange(product: Product): number {
    const newPrice = this.updatedPrices.get(product.id) || product.currentPrice;
    return ((newPrice - product.currentPrice) / product.currentPrice) * 100;
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
