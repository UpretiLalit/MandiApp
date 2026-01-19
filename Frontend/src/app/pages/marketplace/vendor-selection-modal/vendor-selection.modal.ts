import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-vendor-selection',
  templateUrl: './vendor-selection.modal.html',
  styleUrls: ['./vendor-selection.modal.scss'],
})
export class VendorSelectionModal {
  @Input() product: any;

  constructor(private modalController: ModalController) {}

  close() {
    this.modalController.dismiss();
  }

  selectVendor(vendor: any) {
    this.modalController.dismiss({
      vendor: vendor
    });
  }

  getMinPrice(): number {
    if (!this.product?.vendors || this.product.vendors.length === 0) return 0;
    return Math.min(...this.product.vendors.map((v: any) => v.price));
  }

  getMaxPrice(): number {
    if (!this.product?.vendors || this.product.vendors.length === 0) return 0;
    return Math.max(...this.product.vendors.map((v: any) => v.price));
  }

  getVendorShortName(vendorName: string): string {
    // Get first word or first 15 characters
    const firstWord = vendorName.split(' ')[0];
    return firstWord.length > 15 ? firstWord.substring(0, 15) + '...' : firstWord;
  }

  getPricePercentage(price: number): number {
    const maxPrice = this.getMaxPrice();
    if (maxPrice === 0) return 0;
    return (price / maxPrice) * 100;
  }
}
