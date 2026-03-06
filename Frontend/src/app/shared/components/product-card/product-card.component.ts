import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: any;
  @Input() showVendorInfo: boolean = true;
  @Input() showGrade: boolean = true;
  @Input() compact: boolean = false;
  
  @Output() productClick = new EventEmitter<any>();
  @Output() addToCart = new EventEmitter<any>();
  @Output() imageClick = new EventEmitter<any>();

  imageLoaded: boolean = false;
  imageError: boolean = false;
  transformedImageUrl: string = '';
  currentImageIndex: number = 0;

  ngOnInit() {
    this.loadTransformedImage();
  }

  loadTransformedImage() {
    const imageUrl = this.getCurrentImageUrl();
    
    if (!imageUrl) {
      this.imageError = true;
      return;
    }

    // Check if it's a Supabase URL
    if (imageUrl.includes('supabase.co/storage')) {
      this.transformedImageUrl = this.getSupabaseTransformedUrl(imageUrl);
    } else if (imageUrl.includes('unsplash.com')) {
      // Unsplash optimization — use ? for first param (URL has no existing query string)
      const separator = imageUrl.includes('?') ? '&' : '?';
      this.transformedImageUrl = `${imageUrl}${separator}w=400&h=400&fit=crop&fm=webp&q=80`;
    } else {
      // Use original URL for other sources
      this.transformedImageUrl = imageUrl;
    }
  }

  getSupabaseTransformedUrl(originalUrl: string): string {
    // Supabase Image Transformation API
    // Format: https://[project-ref].supabase.co/storage/v1/render/image/[bucket]/[path]?width=400&height=400&format=webp&quality=80
    
    try {
      const url = new URL(originalUrl);
      const pathParts = url.pathname.split('/');
      
      // Find bucket and path
      const storageIndex = pathParts.indexOf('storage');
      if (storageIndex === -1) return originalUrl;
      
      const bucket = pathParts[storageIndex + 2];
      const imagePath = pathParts.slice(storageIndex + 3).join('/');
      
      // Build transformation URL
      const baseUrl = `${url.protocol}//${url.host}`;
      return `${baseUrl}/storage/v1/render/image/${bucket}/${imagePath}?width=400&height=400&format=webp&quality=80&resize=cover`;
    } catch (error) {
      console.error('Error transforming Supabase URL:', error);
      return originalUrl;
    }
  }

  getCurrentImageUrl(): string {
    if (this.product.imageUrls && this.product.imageUrls.length > 0) {
      return this.product.imageUrls[this.currentImageIndex] || this.product.imageUrls[0];
    }
    return this.product.imageUrl || '';
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  onImageError() {
    this.imageError = true;
    this.imageLoaded = true;
  }

  onCardClick() {
    this.productClick.emit(this.product);
  }

  onImageAreaClick(event: Event) {
    event.stopPropagation();
    this.imageClick.emit(this.product);
  }

  onAddToCartClick(event: Event) {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.product.imageUrls && this.product.imageUrls.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.imageUrls.length;
      this.imageLoaded = false;
      this.loadTransformedImage();
    }
  }

  previousImage(event: Event) {
    event.stopPropagation();
    if (this.product.imageUrls && this.product.imageUrls.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.product.imageUrls.length - 1 
        : this.currentImageIndex - 1;
      this.imageLoaded = false;
      this.loadTransformedImage();
    }
  }

  hasMultipleImages(): boolean {
    return this.product.imageUrls && this.product.imageUrls.length > 1;
  }

  getImageCount(): number {
    return this.product.imageUrls?.length || 0;
  }

  getBestPrice(): number {
    if (this.product.vendors && this.product.vendors.length > 0) {
      return this.product.vendors[0].price;
    }
    return this.product.currentPrice || 0;
  }

  getGrade(): string {
    if (this.product.vendors && this.product.vendors.length > 0) {
      return this.product.vendors[0].grade || this.product.grade || 'B';
    }
    return this.product.grade || 'B';
  }

  getGradeColor(): string {
    const grade = this.getGrade();
    return grade === 'A' ? 'success' : grade === 'B' ? 'warning' : 'danger';
  }
}
