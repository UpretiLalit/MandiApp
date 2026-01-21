import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

interface Product {
  id: string;
  name: string;
  category: string;
  emoji: string;
  unit?: string;
  unitWeight?: string;
  currentPrice?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  showProductForm: boolean = false;
  editingProduct: Product | null = null;
  
  productForm = {
    name: '',
    category: '',
    emoji: '🍅'
  };

  // Popular emoji picker for products
  popularEmojis = [
    // Vegetables
    '🍅', '🥕', '🥔', '🧅', '🥬', '🌽', '🥒', '🫑', '🥦', '🧄',
    // Fruits
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🥭',
    '🍑', '🍐', '🥝', '🍍', '🥥', '🍈',
    // Grains & Pulses
    '🌾', '🍚', '🫘', '🥜',
    // Dairy & Others
    '🥛', '🧈', '🍯', '🥚', '🫙'
  ];

  categories = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy', 'Other'];
  units = ['Kg', 'Quintal', 'Box', 'Dozen', 'Piece', 'Liter'];

  showEmojiPicker: boolean = false;

  fileInput: any;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    // Master product catalog - vendors will add pricing and units
    this.products = [
      {
        id: '1',
        name: 'Tomatoes',
        category: 'Vegetables',
        emoji: '🍅',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Onions',
        category: 'Vegetables',
        emoji: '🧅',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Mangoes',
        category: 'Fruits',
        emoji: '🥭',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  openProductForm() {
    this.showProductForm = true;
    this.editingProduct = null;
    this.productForm = {
      name: '',
      category: '',
      emoji: '🍅'
    };
  }

  closeProductForm() {
    this.showProductForm = false;
    this.editingProduct = null;
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  selectEmoji(emoji: string) {
    this.productForm.emoji = emoji;
    this.showEmojiPicker = false;
  }

  async saveProduct() {
    if (!this.productForm.name.trim()) {
      this.showToast('Please enter product name', 'warning');
      return;
    }

    if (!this.productForm.emoji) {
      this.showToast('Please select an emoji icon', 'warning');
      return;
    }

    if (!this.productForm.category) {
      this.showToast('Please select a category', 'warning');
      return;
    }

    if (this.editingProduct) {
      // Update existing product
      const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          name: this.productForm.name,
          category: this.productForm.category,
          emoji: this.productForm.emoji,
          updatedAt: new Date()
        };
        this.showToast(`✅ ${this.productForm.name} updated successfully!`, 'success');
      }
    } else {
      // Create new product in master catalog
      const newProduct: Product = {
        id: Date.now().toString(),
        name: this.productForm.name,
        category: this.productForm.category,
        emoji: this.productForm.emoji,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.products.unshift(newProduct);
      this.showToast(`✅ ${this.productForm.name} added to catalog!`, 'success');
    }

    this.closeProductForm();
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm = {
      name: product.name,
      category: product.category,
      emoji: product.emoji
    };
    this.showProductForm = true;
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Delete Product',
      message: `Are you sure you want to delete <strong>${product.emoji} ${product.name}</strong>?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.products = this.products.filter(p => p.id !== product.id);
            this.showToast(`❌ ${product.name} deleted`, 'warning');
          }
        }
      ]
    });
    await alert.present();
  }

  async toggleProductStatus(product: Product) {
    product.isActive = !product.isActive;
    const status = product.isActive ? 'activated' : 'deactivated';
    this.showToast(`${product.emoji} ${product.name} ${status}`, product.isActive ? 'success' : 'medium');
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }

  getProductsByCategory(category: string): number {
    return this.products.filter(p => p.category === category).length;
  }

  getActiveProducts(): number {
    return this.products.filter(p => p.isActive).length;
  }

  // Download blank template for bulk import
  downloadTemplate() {
    const headers = [
      'Product Name*',
      'Category*',
      'Emoji*',
      'Unit*',
      'Unit Weight',
      'Base Price*',
      'Description',
      'Is Active'
    ];

    const exampleRows = [
      ['Tomatoes', 'Vegetables', '🍅', 'Kg', '1kg', '50', 'Fresh red tomatoes', 'TRUE'],
      ['Onions', 'Vegetables', '🧅', 'Kg', '1kg', '30', 'Fresh onions', 'TRUE'],
      ['Mangoes', 'Fruits', '🥭', 'Dozen', '12 pieces', '200', 'Alphonso mangoes', 'TRUE']
    ];

    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'product-import-template.csv';
    link.click();
    
    this.showToast('📥 Template downloaded. Fill it and import!', 'success');
  }

  // Export current products to CSV
  exportProducts() {
    if (this.products.length === 0) {
      this.showToast('No products to export', 'warning');
      return;
    }

    const headers = [
      'Product ID',
      'Product Name',
      'Category',
      'Emoji',
      'Unit',
      'Unit Weight',
      'Base Price',
      'Description',
      'Is Active',
      'Created At',
      'Updated At'
    ];

    const rows = this.products.map(p => [
      p.id,
      p.name,
      p.category,
      p.emoji,
      p.unit || '',
      p.unitWeight || '',
      p.currentPrice?.toString() || '',
      p.description || '',
      p.isActive ? 'TRUE' : 'FALSE',
      p.createdAt.toISOString(),
      p.updatedAt.toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `products-export-${timestamp}.csv`;
    link.click();
    
    this.showToast(`✅ Exported ${this.products.length} products`, 'success');
  }

  // Trigger hidden file input
  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
    fileInput?.click();
  }

  // Import products from CSV
  async importProducts(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const text = e.target.result;
        const rows = text.split('\n').filter((row: string) => row.trim());
        
        if (rows.length < 2) {
          this.showToast('File is empty or invalid', 'danger');
          return;
        }

        const headers = rows[0].split(',').map((h: string) => h.replace(/"/g, '').trim());
        const dataRows = rows.slice(1);

        let imported = 0;
        let skipped = 0;

        for (const row of dataRows) {
          const cells = this.parseCSVRow(row);
          if (cells.length < 6) {
            skipped++;
            continue;
          }

          const [name, category, emoji, unit, unitWeight, price, description, isActive] = cells;

          if (!name || !category || !emoji || !unit || !price) {
            skipped++;
            continue;
          }

          const newProduct: Product = {
            id: Date.now().toString() + Math.random(),
            name: name.trim(),
            category: category.trim(),
            emoji: emoji.trim(),
            unit: unit.trim(),
            unitWeight: unitWeight?.trim() || '',
            currentPrice: parseFloat(price) || 0,
            description: description?.trim() || '',
            isActive: isActive?.toUpperCase() !== 'FALSE',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          this.products.push(newProduct);
          imported++;
        }

        event.target.value = '';
        this.showToast(`✅ Imported ${imported} products${skipped > 0 ? `, skipped ${skipped}` : ''}`, 'success');
      } catch (error) {
        console.error('Import error:', error);
        this.showToast('Failed to import file. Check format.', 'danger');
      }
    };
    reader.readAsText(file);
  }

  // Parse CSV row handling quoted values
  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }
}
