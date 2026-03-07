import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { ProductService } from '@core/services/product.service';
import { MasterProductService } from '@core/services/master-product.service';
import { OrderService } from '@core/services/order.service';
import { SignalrService, PriceUpdateEvent } from '@core/services/signalr.service';
import { Product } from '@core/models/product.model';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
})
export class MarketplacePage implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: any[] = [];
  categories: string[] = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices'];
  selectedCategory: string = 'All';
  searchTerm: string = '';
  cartCount: number = 0;
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' = 'name';
  showSearch: boolean = false;
  showFilters: boolean = false;
  expandedProducts: Set<string> = new Set();
  priceFlashMap: Map<string, boolean> = new Map();
  private priceHistory = new Map<string, { price: number, timestamp: Date }>();
  productQuantities: Map<string, number> = new Map();
  quantityStepperVisible: Map<string, boolean> = new Map();
  expandedVendors: Set<string> = new Set();
  productsInCart: Set<string> = new Set();
  private _masterProductsCache: any[] = [];
  
  // Image Viewer Properties
  isImageViewerOpen: boolean = false;
  selectedProduct: any = null;
  zoomLevel: number = 1;
  panX: number = 0;
  panY: number = 0;
  private lastTouchDistance: number = 0;
  private lastTouchX: number = 0;
  private lastTouchY: number = 0;
  
  // Carousel Properties
  private imageIndexMap: Map<string, number> = new Map(); // Track current image per product
  currentViewerImageIndex: number = 0;
  private viewerTouchStartX: number = 0;
  private viewerSwipeThreshold: number = 50;
  
  private priceUpdateSubscription?: Subscription;
  private connectionStateSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private masterProductService: MasterProductService,
    private orderService: OrderService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private signalrService: SignalrService
  ) {}

  ngOnInit() {
    // Load critical data first
    this.loadProducts();
    this.loadCartCount();
    
    // Defer SignalR connection to not block initial load
    setTimeout(() => this.initializeSignalR(), 2000);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.priceUpdateSubscription?.unsubscribe();
    this.connectionStateSubscription?.unsubscribe();
    this.signalrService.stopConnection();
  }

  async initializeSignalR() {
    try {
      // Non-blocking connection attempt
      this.signalrService.startConnection().catch(err => {
        // Silently fail - don't block user experience
        console.warn('SignalR connection failed (non-critical):', err);
      });
      
      // Subscribe to price updates
      this.priceUpdateSubscription = this.signalrService.priceUpdate$.subscribe(
        (update: PriceUpdateEvent | null) => {
          if (update) {
            this.handlePriceUpdate(update);
          }
        }
      );

      // Subscribe to connection state
      this.connectionStateSubscription = this.signalrService.connectionState$.subscribe(
        (state) => {
          // Only log in dev mode
          if (!environment.production) {
            console.log('SignalR:', state);
          }
        }
      );
    } catch (error) {
      // Non-critical error - don't block user
      console.warn('SignalR init failed (non-critical):', error);
    }
  }

  handlePriceUpdate(update: PriceUpdateEvent) {
    console.log('Handling price update:', update);
    
    // Find the product in raw products list
    const productIndex = this.products.findIndex(p => 
      p.id.toString() === update.productId && p.vendorId === update.vendorId
    );
    
    if (productIndex !== -1) {
      // Update the raw product price
      this.products[productIndex].currentPrice = update.newPrice;
      
      // Re-apply filters to update grouped products
      this.applyFilters();
      
      // Flash the updated price
      const flashKey = `${update.productId}-${update.vendorId}`;
      this.priceFlashMap.set(flashKey, true);
      
      // Show toast notification
      const product = this.products[productIndex];
      this.showToast(
        `💰 ${product.name} price updated to ₹${update.newPrice} by ${product.vendorName}`,
        'success'
      );
      
      // Remove flash after animation
      setTimeout(() => {
        this.priceFlashMap.set(flashKey, false);
      }, 2000);
    }
  }

  isPriceFlashing(productId: string, vendorId: string): boolean {
    return this.priceFlashMap.get(`${productId}-${vendorId}`) || false;
  }

  getPriceChange(productId: string, vendorId: string, currentPrice: number): { direction: 'up' | 'down' | 'same', percentage: number } {
    const key = `${productId}-${vendorId}`;
    const history = this.priceHistory.get(key);
    
    if (!history) {
      // Store current price as baseline
      this.priceHistory.set(key, { price: currentPrice, timestamp: new Date() });
      return { direction: 'same', percentage: 0 };
    }

    const priceDiff = currentPrice - history.price;
    const percentage = Math.abs((priceDiff / history.price) * 100);
    
    if (priceDiff > 0) {
      return { direction: 'up', percentage: parseFloat(percentage.toFixed(1)) };
    } else if (priceDiff < 0) {
      return { direction: 'down', percentage: parseFloat(percentage.toFixed(1)) };
    }
    return { direction: 'same', percentage: 0 };
  }

  getStatusTags(vendor: any): string[] {
    const tags: string[] = [];
    
    // Limited Stock: quantity < 100 units
    if (vendor.quantity > 0 && vendor.quantity < 100) {
      tags.push('Limited Stock');
    }
    
    // Bulk Only: minimum quantity > 50 (use vendorRating < 4.3 as proxy for bulk)
    if (vendor.vendorRating < 4.3 && vendor.quantity > 500) {
      tags.push('Bulk Only');
    }
    
    // Fresh Arrival: high rating suggests recent fresh stock
    if (vendor.vendorRating >= 4.7) {
      tags.push('Fresh Arrival');
    }
    
    return tags;
  }

  getStatusColor(tag: string): string {
    switch(tag) {
      case 'Fresh Arrival': return 'success';
      case 'Limited Stock': return 'warning';
      case 'Bulk Only': return 'medium';
      default: return 'primary';
    }
  }

  async loadProducts() {
    forkJoin({
      masterProducts: this.masterProductService.getLiveMasterProducts().pipe(catchError(() => of([]))),
      vendorProducts: this.productService.getProducts().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ masterProducts, vendorProducts }: { masterProducts: any[], vendorProducts: any[] }) => {
        const imageMap = this.getProductImageMap();

        // Step 1: Group vendor products into display cards with pricing
        let vendorGrouped: any[] = [];
        if (vendorProducts && vendorProducts.length > 0) {
          const rawGrouped = vendorProducts[0]?.vendors ? vendorProducts : this.groupProducts(vendorProducts);
          vendorGrouped = rawGrouped.map((gp: any) => {
            const nameNorm = gp.name.toLowerCase().trim()
              .replace(/^(fresh|premium|organic|farm)\s+/i, '').trim();
            const fallbackImages = imageMap[nameNorm]
              || imageMap[gp.name.toLowerCase().trim()]
              || imageMap[nameNorm.replace(/s$/, '')] // singular
              || imageMap[nameNorm + 's'];             // plural
            return {
              ...gp,
              imageUrls: (fallbackImages || gp.imageUrls) ?? [],
              imageUrl: fallbackImages?.[0] || gp.imageUrl,
            };
          });
        }

        // Step 2: Convert master catalog products into display cards (no vendor pricing yet)
        const vendorNames = new Set(vendorGrouped.map((g: any) => g.name.toLowerCase().trim()));
        const masterCards: any[] = (masterProducts || [])
          .filter((mp: any) => !vendorNames.has(mp.name.toLowerCase().trim()))
          .map((mp: any) => {
            // imageUrls may arrive as space-separated string (API) or already as array (after service normalization)
            const rawUrls: string[] = typeof mp.imageUrls === 'string'
              ? mp.imageUrls.split(' ').map((u: string) => u.trim()).filter((u: string) => u.startsWith('http'))
              : (Array.isArray(mp.imageUrls) ? mp.imageUrls : []);
            const imgs = rawUrls.map((u: string) =>
              u.includes('unsplash.com') && !u.includes('?')
                ? `${u}?w=400&h=400&fit=crop&q=80` : u);
            // Lookup hardcoded image if API URLs are empty
            const nameNorm = mp.name.toLowerCase().trim().replace(/s$/, '');
            const fallback = imageMap[mp.name.toLowerCase().trim()]
              || imageMap[nameNorm]
              || imageMap[nameNorm + 's'];
            const finalImgs = imgs.length > 0 ? imgs : (fallback || []);
            return {
              name: mp.name,
              nameHindi: mp.nameHindi,
              category: mp.category,
              unit: mp.unit || 'kg',
              unitWeight: `1 ${mp.unit || 'kg'}`,
              imageUrls: finalImgs,
              imageUrl: finalImgs[0] || '',
              emoji: mp.emoji,
              availableQuantity: null, // no vendor listing yet
              vendors: [],
            };
          });

        // Step 3: Combine — vendor products first (have prices), then master catalog
        // Deduplicate by name (case-insensitive) — vendor entry wins over master-only entry
        const seenNames = new Set<string>(vendorGrouped.map((g: any) => g.name.toLowerCase().trim()));
        const dedupedMaster = masterCards.filter((m: any) => {
          const key = m.name.toLowerCase().trim();
          if (seenNames.has(key)) return false;
          seenNames.add(key);
          return true;
        });
        const combined = [...vendorGrouped, ...dedupedMaster];

        this._masterProductsCache = combined;
        this.products = [];
        this.filteredProducts = combined;
        this.extractCategoriesFromGrouped();
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.products = this.getMockProducts();
        this.filteredProducts = this.groupProducts(this.products);
        this.extractCategories();
      }
    });
  }

  /** Hardcoded reliable Unsplash images for common mandi products */
  private getProductImageMap(): { [key: string]: string[] } {
    return {
      'tomatoes': ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop&q=80'],
      'tomato': ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop&q=80'],
      'onions': ['https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop&q=80'],
      'onion': ['https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop&q=80'],
      'red onions': ['https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop&q=80'],
      'potatoes': ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&q=80'],
      'potato': ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&q=80'],
      'carrots': ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop&q=80'],
      'carrot': ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop&q=80'],
      'गाजर': ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop&q=80'],
      'spinach': ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop&q=80'],
      'cabbage': ['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=400&fit=crop&q=80'],
      'cauliflower': ['https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=400&h=400&fit=crop&q=80'],
      'brinjal': ['https://images.unsplash.com/photo-1659216320598-9b6b638c8e7c?w=400&h=400&fit=crop&q=80'],
      'eggplant': ['https://images.unsplash.com/photo-1659216320598-9b6b638c8e7c?w=400&h=400&fit=crop&q=80'],
      'peas': ['https://images.unsplash.com/photo-1563565341-e60e9631a1bb?w=400&h=400&fit=crop&q=80'],
      'beans': ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop&q=80'],
      'bitter gourd': ['https://images.unsplash.com/photo-1617692855027-33b14f061079?w=400&h=400&fit=crop&q=80'],
      'bottle gourd': ['https://images.unsplash.com/photo-1617692855027-33b14f061079?w=400&h=400&fit=crop&q=80'],
      'ladyfinger': ['https://images.unsplash.com/photo-1627735068680-a26a4e9e0bd0?w=400&h=400&fit=crop&q=80'],
      'okra': ['https://images.unsplash.com/photo-1627735068680-a26a4e9e0bd0?w=400&h=400&fit=crop&q=80'],
      'ginger': ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop&q=80'],
      'garlic': ['https://images.unsplash.com/photo-1501420193920-91f50c93b4be?w=400&h=400&fit=crop&q=80'],
      'apples': ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&q=80'],
      'apple': ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&q=80'],
      'bananas': ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&q=80'],
      'banana': ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&q=80'],
      'mangoes': ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop&q=80'],
      'mango': ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop&q=80'],
      'oranges': ['https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop&q=80'],
      'orange': ['https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop&q=80'],
      'grapes': ['https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop&q=80'],
      'rice': ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&q=80'],
      'wheat': ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&q=80'],
      'turmeric': ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop&q=80'],
      'chili': ['https://images.unsplash.com/photo-1625938144755-ef4b4b3e5a2c?w=400&h=400&fit=crop&q=80'],
      'chilli': ['https://images.unsplash.com/photo-1625938144755-ef4b4b3e5a2c?w=400&h=400&fit=crop&q=80'],
      'milk': ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&q=80'],
      'paneer': ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop&q=80'],
    };
  }

  // Performance optimization - trackBy for ngFor
  trackByProductName(index: number, product: any): string {
    return product.name || index;
  }

  trackByVendorId(index: number, vendor: any): string {
    return vendor.vendorId || index;
  }

  groupProducts(products: Product[]): any[] {
    const grouped = new Map();
    
    // Emoji mapping for products
    const emojiMap: {[key: string]: string} = {
      'Tomatoes': '🍅',
      'Fresh Tomatoes': '🍅',
      'Onions': '🧅',
      'Potatoes': '🥔',
      'Carrots': '🥕',
      'Spinach': '🥬',
      'Cabbage': '🥬',
      'Apples': '🍎',
      'Bananas': '🍌',
      'Mangoes': '🥭',
      'Oranges': '🍊',
      'Grapes': '🍇',
      'Rice': '🌾',
      'Basmati Rice': '🌾',
      'Wheat': '🌾',
      'Corn': '🌽',
      'Milk': '🥛',
      'Paneer': '🧈',
      'Turmeric': '🌿',
      'Chili': '🌶️',
      'Pepper': '🫑'
    };
    
    products.forEach(product => {
      if (!grouped.has(product.name)) {
        grouped.set(product.name, {
          name: product.name,
          category: product.category,
          unit: product.unit,
          unitWeight: product.minOrderQty ? `${product.minOrderQty} ${product.unit}` : '1 kg',
          imageUrl: product.imageUrl,
          emoji: emojiMap[product.name] || '🥬', // Default emoji
          availableQuantity: 0, // Will be calculated from all vendors
          vendors: []
        });
      }
      
      // Extract grade from description (A, B, or C)
      const gradeMatch = product.description?.match(/Grade ([ABC])/);
      const grade = gradeMatch ? gradeMatch[1] : 'B';
      
      // Only add vendors with stock available
      if (product.availableQuantity > 0) {
        grouped.get(product.name).vendors.push({
          id: product.id,
          vendorId: product.vendorId,
          vendorName: product.vendorName,
          vendorRating: product.vendorRating,
          price: product.currentPrice,
          quantity: product.availableQuantity,
          isActive: product.isActive,
          grade: grade,
          description: product.description
        });
        // Add to total available quantity
        grouped.get(product.name).availableQuantity += product.availableQuantity;
      }
    });
    
    return Array.from(grouped.values())
      .filter(item => item.vendors.length > 0) // Only show products with available vendors
      .map(item => {
      // Multi-level sorting: Price (lowest first), Rating (highest first), Stock (highest first)
      item.vendors.sort((a: any, b: any) => {
        // Primary: Price (ascending - lowest first)
        if (a.price !== b.price) {
          return a.price - b.price;
        }
        // Secondary: Rating (descending - highest first)
        if (a.vendorRating !== b.vendorRating) {
          return b.vendorRating - a.vendorRating;
        }
        // Tertiary: Stock quantity (descending - highest first)
        return b.quantity - a.quantity;
      });
      return item;
    });
  }

  getMockProducts(): Product[] {
    return [
      // Vegetables - Multiple vendors
      {
        id: 1,
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        currentPrice: 40,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 500,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
        description: 'Premium Grade A - Fresh red tomatoes',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        currentPrice: 35,
        unit: 'kg',
        vendorId: '2',
        vendorName: 'Green Valley Suppliers',
        vendorRating: 4.2,
        availableQuantity: 300,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
        description: 'Grade B - Fresh tomatoes, bulk pricing',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Onions',
        category: 'Vegetables',
        currentPrice: 30,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 800,
        imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400',
        description: 'Premium Grade A - Fresh onions',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Onions',
        category: 'Vegetables',
        currentPrice: 28,
        unit: 'kg',
        vendorId: '2',
        vendorName: 'Green Valley Suppliers',
        vendorRating: 4.2,
        availableQuantity: 600,
        imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400',
        description: 'Grade A - Fresh onions',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Potatoes',
        category: 'Vegetables',
        currentPrice: 25,
        unit: 'kg',
        vendorId: '2',
        vendorName: 'Green Valley Suppliers',
        vendorRating: 4.2,
        availableQuantity: 1000,
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
        description: 'Grade A - Fresh potatoes',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Carrots',
        category: 'Vegetables',
        currentPrice: 35,
        unit: 'kg',
        vendorId: '2',
        vendorName: 'Green Valley Suppliers',
        vendorRating: 4.2,
        availableQuantity: 300,
        imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
        description: 'Premium Grade A - Fresh carrots',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 17,
        name: 'Carrots',
        category: 'Vegetables',
        currentPrice: 22,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 500,
        imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
        description: 'Grade C - Small size carrots for processing',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Fruits - Multiple vendors and grades
      {
        id: 7,
        name: 'Apples',
        category: 'Fruits',
        currentPrice: 120,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 400,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
        description: 'Premium Grade AAA - Kashmir Apples',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 8,
        name: 'Apples',
        category: 'Fruits',
        currentPrice: 90,
        unit: 'kg',
        vendorId: '2',
        vendorName: 'Green Valley Suppliers',
        vendorRating: 4.2,
        availableQuantity: 500,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
        description: 'Grade A - Fresh Apples',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 9,
        name: 'Bananas',
        category: 'Fruits',
        currentPrice: 50,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 800,
        imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400',
        description: 'Premium Grade A - Fresh yellow bananas',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 10,
        name: 'Bananas',
        category: 'Fruits',
        currentPrice: 45,
        unit: 'kg',
        vendorId: '2',
        vendorName: 'Green Valley Suppliers',
        vendorRating: 4.2,
        availableQuantity: 600,
        imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400',
        description: 'Grade A - Fresh bananas, bulk pricing',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 11,
        name: 'Mangoes',
        category: 'Fruits',
        currentPrice: 150,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 200,
        imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
        description: 'Premium Grade AAA - Alphonso Mangoes',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 12,
        name: 'Mangoes',
        category: 'Fruits',
        currentPrice: 110,
        unit: 'kg',
        vendorId: '2',
        vendorName: 'Green Valley Suppliers',
        vendorRating: 4.2,
        availableQuantity: 250,
        imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
        description: 'Grade A - Fresh Mangoes',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 13,
        name: 'Oranges',
        category: 'Fruits',
        currentPrice: 80,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 600,
        imageUrl: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400',
        description: 'Premium Grade A - Fresh juicy oranges',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 14,
        name: 'Grapes',
        category: 'Fruits',
        currentPrice: 100,
        unit: 'kg',
        vendorId: '2',
        vendorName: 'Green Valley Suppliers',
        vendorRating: 4.2,
        availableQuantity: 300,
        imageUrl: 'https://images.unsplash.com/photo-1599819177626-c0d609851644?w=400',
        description: 'Grade A - Seedless green grapes',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 18,
        name: 'Grapes',
        category: 'Fruits',
        currentPrice: 65,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 200,
        imageUrl: 'https://images.unsplash.com/photo-1599819177626-c0d609851644?w=400',
        description: 'Grade C - Small grapes for juice processing',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Grains
      {
        id: 15,
        name: 'Basmati Rice',
        category: 'Grains',
        currentPrice: 80,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 2000,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        description: 'Premium Grade AAA - Aged Basmati rice',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 16,
        name: 'Wheat',
        category: 'Grains',
        currentPrice: 35,
        unit: 'kg',
        vendorId: '1',
        vendorName: 'Fresh Farms Co.',
        vendorRating: 4.5,
        availableQuantity: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
        description: 'Premium Grade A - Fresh wheat grains',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  extractCategories() {
    const cats = new Set(this.products.map(p => p.category));
    this.categories = ['All', ...Array.from(cats)];
  }
  
  extractCategoriesFromGrouped() {
    const categoriesSet = new Set<string>();
    categoriesSet.add('All');
    this.filteredProducts.forEach((product: any) => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });
    this.categories = Array.from(categoriesSet);
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  changeSortOrder(event: any) {
    this.sortBy = event.detail.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  // Normalize category for comparison (handles singular/plural from API)
  private normalizeCategory(cat: string): string {
    const map: {[k: string]: string} = {
      'Fruit': 'Fruits', 'Vegetable': 'Vegetables', 'Grain': 'Grains',
      'Dairy': 'Dairy', 'Spice': 'Spices', 'Herb': 'Herbs'
    };
    return map[cat] || cat;
  }

  applyFilters() {
    // Master products path — use cache for clean re-filtering
    const source: any[] = this._masterProductsCache && this._masterProductsCache.length > 0
      ? this._masterProductsCache
      : (this.products && this.products.length > 0 ? this.products : this.filteredProducts);

    let filtered = source;

    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter((p: any) =>
        this.normalizeCategory(p.category) === this.selectedCategory
      );
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((p: any) =>
        p.name.toLowerCase().includes(term) ||
        (p.nameHindi && p.nameHindi.toLowerCase().includes(term))
      );
    }

    this.filteredProducts = filtered;
  }

  sortProducts(products: Product[]): Product[] {
    switch (this.sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.currentPrice - b.currentPrice);
      case 'price-high':
        return [...products].sort((a, b) => b.currentPrice - a.currentPrice);
      case 'rating':
        return [...products].sort((a, b) => (b.vendorRating || 0) - (a.vendorRating || 0));
      default:
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  async quickAdd(vendor: any, product: any) {
    const minQty = vendor.minOrderQty || 1;
    
    if (vendor.quantity === 0) {
      this.showToast('Out of stock', 'warning');
      return;
    }
    
    if (vendor.quantity < minQty) {
      this.showToast(`Not enough stock available`, 'warning');
      return;
    }
    
    this.addToCartWithQuantity(product, vendor, minQty);
  }

  loadCartCount() {
    this.orderService.getCart().subscribe({
      next: (cart) => {
        this.cartCount = cart.cartItems?.length || 0;
      },
      error: (error) => console.error('Error loading cart:', error)
    });
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  async quickBuyBestPrice(product: any) {
    // Master-only catalog products have no vendors — can't add to cart
    if (!product.vendors || product.vendors.length === 0) {
      this.showToast('No vendors available for this product yet', 'warning');
      return;
    }

    const bestVendor = product.vendors[0];
    
    // If stepper is not visible, show it first
    if (!this.quantityStepperVisible.get(product.name)) {
      this.quantityStepperVisible.set(product.name, true);
      return;
    }
    
    // If stepper is visible, proceed with adding to cart
    const qty = this.getProductQuantity(product.name);
    
    if (bestVendor.quantity === 0) {
      this.showToast('This product is currently out of stock', 'warning');
      return;
    }
    
    if (bestVendor.quantity < qty) {
      this.showToast(`Not enough stock available`, 'warning');
      return;
    }
    
    await this.addToCartWithQuantity(product, bestVendor, qty);
    // Hide stepper after successful add
    this.quantityStepperVisible.set(product.name, false);
  }
  
  async addToCartWithQuantity(product: any, vendor: any, quantity: number) {
    // vendor.id is the actual DB product integer ID (set in groupProducts)
    // product.id may be undefined for grouped display cards
    const productId = vendor.id ?? product.id;
    if (!productId) {
      this.showToast('Cannot add this product to cart', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Adding to cart...',
      duration: 1000
    });
    await loading.present();

    const cartItem = {
      ProductId: productId,
      ProductName: product.name,
      VendorId: vendor.vendorId || '',
      VendorName: vendor.vendorName || '',
      Quantity: quantity,
      UnitPrice: vendor.price ?? vendor.currentPrice ?? 0,
      Unit: product.unit || 'kg',
      Grade: vendor.grade || ''
    };

    this.orderService.addToCart(cartItem).subscribe({
      next: () => {
        loading.dismiss();
        this.cartCount++;
        // Add product to cart tracking
        this.productsInCart.add(product.name);
        // Filter out the product from display
        this.filteredProducts = this.filteredProducts.filter(p => p.name !== product.name);
        this.showToast(
          `✓ Added ${quantity} ${product.unit}${quantity > 1 ? 's' : ''}`,
          'success'
        );
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error adding to cart:', error);
        this.showToast('Failed to add to cart', 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchTerm = '';
      this.applyFilters();
    }
    if (this.showSearch && this.showFilters) {
      this.showFilters = false;
    }
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
    if (this.showSearch && this.showFilters) {
      this.showSearch = false;
    }
  }

  toggleProductExpansion(productName: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.expandedProducts.has(productName)) {
      this.expandedProducts.delete(productName);
    } else {
      this.expandedProducts.add(productName);
    }
  }

  isProductExpanded(productName: string): boolean {
    return this.expandedProducts.has(productName);
  }

  getProductIcon(category: string): string {
    const icons: any = {
      'Vegetables': 'leaf-outline',
      'Fruits': 'nutrition-outline',
      'Grains': 'fast-food-outline',
      'Dairy': 'water-outline',
      'Spices': 'flask-outline'
    };
    return icons[category] || 'cube-outline';
  }

  getGradientClass(category: string): string {
    const gradients: any = {
      'Vegetables': 'gradient-green',
      'Fruits': 'gradient-orange',
      'Grains': 'gradient-yellow',
      'Dairy': 'gradient-blue',
      'Spices': 'gradient-red'
    };
    return gradients[category] || 'gradient-purple';
  }

  async showGradeInfo() {
    const alert = await this.alertController.create({
      header: 'Product Quality Grades',
      cssClass: 'grade-info-alert',
      message: `
        <div style="text-align: left; line-height: 1.6;">
          <p style="margin: 12px 0; padding: 8px; background: #d4edda; border-radius: 8px;">
            <strong style="color: #28a745; font-size: 1.1em;">Grade A (Premium)</strong><br/>
            <span style="color: #155724;">Best color, no spots, firm texture. Highest price point.</span>
          </p>
          
          <p style="margin: 12px 0; padding: 8px; background: #fff3cd; border-radius: 8px;">
            <strong style="color: #ffc107; font-size: 1.1em;">Grade B (Market)</strong><br/>
            <span style="color: #856404;">Standard quality, minor spots allowed. Average price.</span>
          </p>
          
          <p style="margin: 12px 0; padding: 8px; background: #f8d7da; border-radius: 8px;">
            <strong style="color: #dc3545; font-size: 1.1em;">Grade C (Economy/Processing)</strong><br/>
            <span style="color: #721c24;">Overripe or small size. Cheapest price point.</span>
          </p>
        </div>
      `,
      buttons: [{
        text: 'Got it',
        role: 'cancel'
      }]
    });
    await alert.present();
  }

  // Quantity management methods
  getProductQuantity(productName: string): number {
    if (!this.productQuantities.has(productName)) {
      // Initialize with minimum quantity from best vendor
      const product = this.filteredProducts.find((p: any) => p.name === productName);
      const minQty = product?.vendors[0]?.minOrderQty || 1;
      this.productQuantities.set(productName, minQty);
      return minQty;
    }
    return this.productQuantities.get(productName) || 1;
  }

  incrementQuantity(product: any, event?: Event) {
    if (event) event.stopPropagation();
    
    const bestVendor = product.vendors[0];
    const maxQty = Math.min(bestVendor.maxOrderQty || 999, bestVendor.quantity);
    const currentQty = this.getProductQuantity(product.name);
    
    if (currentQty < maxQty) {
      this.productQuantities.set(product.name, currentQty + 1);
    }
  }

  decrementQuantity(product: any, event?: Event) {
    if (event) event.stopPropagation();
    
    const bestVendor = product.vendors[0];
    const minQty = bestVendor.minOrderQty || 1;
    const currentQty = this.getProductQuantity(product.name);
    
    if (currentQty > minQty) {
      this.productQuantities.set(product.name, currentQty - 1);
    }
  }

  canIncrement(product: any): boolean {
    const bestVendor = product.vendors[0];
    const maxQty = Math.min(bestVendor.maxOrderQty || 999, bestVendor.quantity);
    return this.getProductQuantity(product.name) < maxQty;
  }

  canDecrement(product: any): boolean {
    const bestVendor = product.vendors[0];
    const minQty = bestVendor.minOrderQty || 1;
    return this.getProductQuantity(product.name) > minQty;
  }

  isQuantityStepperVisible(productName: string): boolean {
    return this.quantityStepperVisible.get(productName) || false;
  }

  toggleVendorExpansion(productName: string, vendorId: number, event?: Event): void {
    if (event) event.stopPropagation();
    const key = `${productName}-${vendorId}`;
    if (this.expandedVendors.has(key)) {
      this.expandedVendors.delete(key);
    } else {
      this.expandedVendors.add(key);
    }
  }

  isVendorExpanded(productName: string, vendorId: number): boolean {
    return this.expandedVendors.has(`${productName}-${vendorId}`);
  }

  // Image Viewer Methods
  openImageViewer(product: any) {
    this.selectedProduct = product;
    this.currentViewerImageIndex = this.getCurrentImageIndex(product.name);
    this.isImageViewerOpen = true;
    this.resetZoom();
  }

  closeImageViewer() {
    this.isImageViewerOpen = false;
    this.selectedProduct = null;
    this.currentViewerImageIndex = 0;
    this.resetZoom();
  }

  getProductImages(): string[] {
    if (!this.selectedProduct) return [];
    
    // Use imageUrls array if available, otherwise fallback to single imageUrl or generate placeholder
    if (this.selectedProduct.imageUrls && this.selectedProduct.imageUrls.length > 0) {
      return this.selectedProduct.imageUrls;
    } else if (this.selectedProduct.imageUrl) {
      return [this.selectedProduct.imageUrl];
    } else {
      // Generate placeholder images based on product category
      return this.getPlaceholderImages(this.selectedProduct);
    }
  }

  getPlaceholderImages(product: any): string[] {
    // Return placeholder URLs based on product category and name
    const category = product.category.toLowerCase();
    const name = product.name.toLowerCase().replace(/\s+/g, '-');
    
    // Use Unsplash API for high-quality placeholder images
    return [
      `https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80`, // Vegetables
      `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80`, // Fresh produce
      `https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80`  // Market
    ];
  }

  handleImageError(event: any) {
    // Fallback to placeholder when image fails to load
    event.target.src = 'https://via.placeholder.com/800x600/f8f9fa/6c757d?text=No+Image';
  }

  // Carousel Methods for Product Cards
  getCurrentImageIndex(productName: string): number {
    return this.imageIndexMap.get(productName) || 0;
  }

  setImageIndex(productName: string, index: number, event?: Event) {
    if (event) event.stopPropagation();
    this.imageIndexMap.set(productName, index);
  }

  nextImage(productName: string, event?: Event) {
    if (event) event.stopPropagation();
    const product = this.filteredProducts.find((p: any) => p.name === productName);
    if (product && product.imageUrls) {
      const currentIndex = this.getCurrentImageIndex(productName);
      const nextIndex = (currentIndex + 1) % product.imageUrls.length;
      this.setImageIndex(productName, nextIndex);
    }
  }

  previousImage(productName: string, event?: Event) {
    if (event) event.stopPropagation();
    const product = this.filteredProducts.find((p: any) => p.name === productName);
    if (product && product.imageUrls) {
      const currentIndex = this.getCurrentImageIndex(productName);
      const prevIndex = currentIndex === 0 ? product.imageUrls.length - 1 : currentIndex - 1;
      this.setImageIndex(productName, prevIndex);
    }
  }

  // Gallery Viewer Navigation
  nextViewerImage() {
    const images = this.getProductImages();
    if (this.currentViewerImageIndex < images.length - 1) {
      this.currentViewerImageIndex++;
      this.resetZoom();
    }
  }

  previousViewerImage() {
    if (this.currentViewerImageIndex > 0) {
      this.currentViewerImageIndex--;
      this.resetZoom();
    }
  }

  setViewerImageIndex(index: number) {
    this.currentViewerImageIndex = index;
    this.resetZoom();
  }

  handleViewerTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.viewerTouchStartX = event.touches[0].clientX;
    }
  }

  handleViewerTouchMove(event: TouchEvent) {
    // Allow pinch zoom to handle this if two fingers
    if (event.touches.length > 1) return;
  }

  handleViewerTouchEnd(event: TouchEvent) {
    if (event.changedTouches.length === 1 && this.zoomLevel === 1) {
      const touchEndX = event.changedTouches[0].clientX;
      const deltaX = touchEndX - this.viewerTouchStartX;
      
      if (Math.abs(deltaX) > this.viewerSwipeThreshold) {
        if (deltaX > 0) {
          this.previousViewerImage();
        } else {
          this.nextViewerImage();
        }
      }
    }
  }

  addToCartFromViewer() {
    if (this.selectedProduct) {
      this.quickBuyBestPrice(this.selectedProduct);
      this.closeImageViewer();
    }
  }

  zoomIn() {
    if (this.zoomLevel < 3) {
      this.zoomLevel += 0.5;
    }
  }

  zoomOut() {
    if (this.zoomLevel > 1) {
      this.zoomLevel -= 0.5;
      // Reset pan when zooming out to avoid displacement
      if (this.zoomLevel === 1) {
        this.panX = 0;
        this.panY = 0;
      }
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
  }

  handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      // Pinch zoom started
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.lastTouchDistance = this.getDistance(touch1, touch2);
    } else if (event.touches.length === 1 && this.zoomLevel > 1) {
      // Pan started
      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    }
  }

  handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    
    if (event.touches.length === 2) {
      // Pinch zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = this.getDistance(touch1, touch2);
      
      if (this.lastTouchDistance > 0) {
        const scale = currentDistance / this.lastTouchDistance;
        const newZoom = this.zoomLevel * scale;
        
        if (newZoom >= 1 && newZoom <= 3) {
          this.zoomLevel = newZoom;
        }
      }
      
      this.lastTouchDistance = currentDistance;
    } else if (event.touches.length === 1 && this.zoomLevel > 1) {
      // Pan
      const deltaX = event.touches[0].clientX - this.lastTouchX;
      const deltaY = event.touches[0].clientY - this.lastTouchY;
      
      this.panX += deltaX;
      this.panY += deltaY;
      
      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    }
  }

  handleTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      this.lastTouchDistance = 0;
    }
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}