import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

// Interfaces
interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategory[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  parentCategoryId: string;
  isActive: boolean;
}

interface QualityStandard {
  id: string;
  grade: 'A' | 'B' | 'C';
  name: string;
  description: string;
  parameters: QualityParameter[];
  createdAt: Date;
  updatedAt: Date;
}

interface QualityParameter {
  name: string;
  value: string;
  unit?: string;
}

interface PriceAlert {
  id: string;
  categoryId: string;
  categoryName: string;
  floorPrice: number | null;
  ceilingPrice: number | null;
  spikeThresholdPercent: number; // e.g., 50 for 50% spike alert
  timeWindowMinutes: number; // e.g., 60 for 1 hour window
  isActive: boolean;
  lastTriggered?: Date;
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
})
export class MarketplacePage implements OnInit {
  selectedTab: 'categories' | 'quality' | 'pricing' = 'categories';
  selectedNavTab: string = 'marketplace';
  
  // Categories
  categories: Category[] = [];
  showCategoryForm: boolean = false;
  editingCategory: Category | null = null;
  categoryForm = {
    name: '',
    icon: 'nutrition-outline',
    subCategories: [] as string[]
  };
  newSubCategory: string = '';
  
  // Quality Standards
  qualityStandards: QualityStandard[] = [];
  showQualityForm: boolean = false;
  editingQuality: QualityStandard | null = null;
  qualityForm = {
    grade: 'A' as 'A' | 'B' | 'C',
    name: '',
    description: '',
    parameters: [] as QualityParameter[]
  };
  newParameter = { name: '', value: '', unit: '' };
  
  // Price Alerts
  priceAlerts: PriceAlert[] = [];
  showPriceAlertForm: boolean = false;
  editingAlert: PriceAlert | null = null;
  priceAlertForm = {
    categoryId: '',
    floorPrice: null as number | null,
    ceilingPrice: null as number | null,
    spikeThresholdPercent: 50,
    timeWindowMinutes: 60
  };
  
  useMockData: boolean = true;
  
  // Icon options for categories
  categoryIcons = [
    { value: 'nutrition-outline', label: 'Vegetables' },
    { value: 'leaf-outline', label: 'Fruits' },
    { value: 'fast-food-outline', label: 'Grains' },
    { value: 'flower-outline', label: 'Herbs' },
    { value: 'water-outline', label: 'Dairy' },
    { value: 'wine-outline', label: 'Beverages' }
  ];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMockData();
  }
  
  navigateToTab(event: any) {
    const tab = event.detail.value;
    if (tab === 'verification') {
      this.router.navigate(['/admin/verification']);
    } else if (tab === 'users') {
      this.router.navigate(['/admin/users']);
    } else if (tab === 'hubs') {
      this.router.navigate(['/admin/hubs']);
    }
  }
  
  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
  }

  loadMockData() {
    // Mock Categories
    this.categories = [
      {
        id: 'cat-001',
        name: 'Vegetables',
        icon: 'nutrition-outline',
        subCategories: [
          { id: 'sub-001', name: 'Leafy Greens', parentCategoryId: 'cat-001', isActive: true },
          { id: 'sub-002', name: 'Root Vegetables', parentCategoryId: 'cat-001', isActive: true },
          { id: 'sub-003', name: 'Gourds', parentCategoryId: 'cat-001', isActive: true }
        ],
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
        isActive: true
      },
      {
        id: 'cat-002',
        name: 'Fruits',
        icon: 'leaf-outline',
        subCategories: [
          { id: 'sub-004', name: 'Citrus', parentCategoryId: 'cat-002', isActive: true },
          { id: 'sub-005', name: 'Berries', parentCategoryId: 'cat-002', isActive: true },
          { id: 'sub-006', name: 'Tropical', parentCategoryId: 'cat-002', isActive: true }
        ],
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
        isActive: true
      },
      {
        id: 'cat-003',
        name: 'Grains',
        icon: 'fast-food-outline',
        subCategories: [
          { id: 'sub-007', name: 'Rice', parentCategoryId: 'cat-003', isActive: true },
          { id: 'sub-008', name: 'Wheat', parentCategoryId: 'cat-003', isActive: true },
          { id: 'sub-009', name: 'Pulses', parentCategoryId: 'cat-003', isActive: true }
        ],
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
        isActive: true
      }
    ];

    // Mock Quality Standards
    this.qualityStandards = [
      {
        id: 'qs-001',
        grade: 'A',
        name: 'Premium Grade',
        description: 'Highest quality produce with no defects',
        parameters: [
          { name: 'Size Uniformity', value: '95%+', unit: 'percent' },
          { name: 'Color', value: 'Vibrant, natural', unit: '' },
          { name: 'Blemishes', value: '0', unit: 'count' },
          { name: 'Freshness', value: '< 24 hours', unit: 'time' }
        ],
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10')
      },
      {
        id: 'qs-002',
        grade: 'B',
        name: 'Standard Grade',
        description: 'Good quality with minor imperfections',
        parameters: [
          { name: 'Size Uniformity', value: '80-94%', unit: 'percent' },
          { name: 'Color', value: 'Good, slight variation', unit: '' },
          { name: 'Blemishes', value: '1-2', unit: 'count' },
          { name: 'Freshness', value: '24-48 hours', unit: 'time' }
        ],
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10')
      },
      {
        id: 'qs-003',
        grade: 'C',
        name: 'Economy Grade',
        description: 'Acceptable quality with visible defects',
        parameters: [
          { name: 'Size Uniformity', value: '< 80%', unit: 'percent' },
          { name: 'Color', value: 'Variable', unit: '' },
          { name: 'Blemishes', value: '3+', unit: 'count' },
          { name: 'Freshness', value: '48-72 hours', unit: 'time' }
        ],
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10')
      }
    ];

    // Mock Price Alerts
    this.priceAlerts = [
      {
        id: 'pa-001',
        categoryId: 'cat-001',
        categoryName: 'Vegetables',
        floorPrice: 10,
        ceilingPrice: 200,
        spikeThresholdPercent: 50,
        timeWindowMinutes: 60,
        isActive: true,
        lastTriggered: new Date('2026-01-19T14:30:00')
      },
      {
        id: 'pa-002',
        categoryId: 'cat-002',
        categoryName: 'Fruits',
        floorPrice: 20,
        ceilingPrice: 300,
        spikeThresholdPercent: 40,
        timeWindowMinutes: 60,
        isActive: true
      }
    ];
  }

  // ==================== CATEGORY MANAGEMENT ====================
  
  openCategoryForm() {
    this.showCategoryForm = true;
    this.editingCategory = null;
    this.categoryForm = {
      name: '',
      icon: 'nutrition-outline',
      subCategories: []
    };
  }

  closeCategoryForm() {
    this.showCategoryForm = false;
    this.editingCategory = null;
  }

  addSubCategory() {
    if (this.newSubCategory.trim()) {
      this.categoryForm.subCategories.push(this.newSubCategory.trim());
      this.newSubCategory = '';
    }
  }

  removeSubCategory(index: number) {
    this.categoryForm.subCategories.splice(index, 1);
  }

  async saveCategory() {
    if (!this.categoryForm.name.trim()) {
      this.showToast('Please enter category name', 'warning');
      return;
    }

    if (this.editingCategory) {
      // Update existing
      const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
      if (index !== -1) {
        this.categories[index] = {
          ...this.categories[index],
          name: this.categoryForm.name,
          icon: this.categoryForm.icon,
          subCategories: this.categoryForm.subCategories.map((name, idx) => ({
            id: `sub-${Date.now()}-${idx}`,
            name,
            parentCategoryId: this.editingCategory!.id,
            isActive: true
          })),
          updatedAt: new Date()
        };
        this.showToast(`✅ ${this.categoryForm.name} updated`, 'success');
      }
    } else {
      // Create new
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: this.categoryForm.name,
        icon: this.categoryForm.icon,
        subCategories: this.categoryForm.subCategories.map((name, idx) => ({
          id: `sub-${Date.now()}-${idx}`,
          name,
          parentCategoryId: `cat-${Date.now()}`,
          isActive: true
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      this.categories.push(newCategory);
      this.showToast(`✅ ${this.categoryForm.name} created`, 'success');
    }

    this.closeCategoryForm();
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryForm = {
      name: category.name,
      icon: category.icon,
      subCategories: category.subCategories.map(sc => sc.name)
    };
    this.showCategoryForm = true;
  }

  async deleteCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Delete Category',
      message: `Are you sure you want to delete <strong>${category.name}</strong>? This will affect all products in this category.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.categories = this.categories.filter(c => c.id !== category.id);
            this.showToast(`❌ ${category.name} deleted`, 'warning');
          }
        }
      ]
    });
    await alert.present();
  }

  async toggleCategoryStatus(category: Category) {
    category.isActive = !category.isActive;
    const status = category.isActive ? 'activated' : 'deactivated';
    this.showToast(`${category.name} ${status}`, category.isActive ? 'success' : 'warning');
  }

  // ==================== QUALITY STANDARDS ====================

  openQualityForm() {
    this.showQualityForm = true;
    this.editingQuality = null;
    this.qualityForm = {
      grade: 'A',
      name: '',
      description: '',
      parameters: []
    };
  }

  closeQualityForm() {
    this.showQualityForm = false;
    this.editingQuality = null;
  }

  addParameter() {
    if (this.newParameter.name.trim() && this.newParameter.value.trim()) {
      this.qualityForm.parameters.push({ ...this.newParameter });
      this.newParameter = { name: '', value: '', unit: '' };
    }
  }

  removeParameter(index: number) {
    this.qualityForm.parameters.splice(index, 1);
  }

  async saveQualityStandard() {
    if (!this.qualityForm.name.trim() || !this.qualityForm.description.trim()) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    if (this.qualityForm.parameters.length === 0) {
      this.showToast('Please add at least one parameter', 'warning');
      return;
    }

    if (this.editingQuality) {
      // Update existing
      const index = this.qualityStandards.findIndex(q => q.id === this.editingQuality!.id);
      if (index !== -1) {
        this.qualityStandards[index] = {
          ...this.qualityStandards[index],
          name: this.qualityForm.name,
          description: this.qualityForm.description,
          parameters: [...this.qualityForm.parameters],
          updatedAt: new Date()
        };
        this.showToast(`✅ Grade ${this.qualityForm.grade} updated`, 'success');
      }
    } else {
      // Create new
      const newStandard: QualityStandard = {
        id: `qs-${Date.now()}`,
        grade: this.qualityForm.grade,
        name: this.qualityForm.name,
        description: this.qualityForm.description,
        parameters: [...this.qualityForm.parameters],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.qualityStandards.push(newStandard);
      this.showToast(`✅ Grade ${this.qualityForm.grade} standard created`, 'success');
    }

    this.closeQualityForm();
  }

  editQualityStandard(standard: QualityStandard) {
    this.editingQuality = standard;
    this.qualityForm = {
      grade: standard.grade,
      name: standard.name,
      description: standard.description,
      parameters: [...standard.parameters]
    };
    this.showQualityForm = true;
  }

  async deleteQualityStandard(standard: QualityStandard) {
    const alert = await this.alertController.create({
      header: 'Delete Quality Standard',
      message: `Delete Grade ${standard.grade} - ${standard.name}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.qualityStandards = this.qualityStandards.filter(q => q.id !== standard.id);
            this.showToast(`❌ Grade ${standard.grade} deleted`, 'warning');
          }
        }
      ]
    });
    await alert.present();
  }

  getGradeColor(grade: string): string {
    const colors: Record<string, string> = {
      'A': 'success',
      'B': 'warning',
      'C': 'medium'
    };
    return colors[grade] || 'primary';
  }

  // ==================== PRICE ALERTS ====================

  openPriceAlertForm() {
    this.showPriceAlertForm = true;
    this.editingAlert = null;
    this.priceAlertForm = {
      categoryId: '',
      floorPrice: null,
      ceilingPrice: null,
      spikeThresholdPercent: 50,
      timeWindowMinutes: 60
    };
  }

  closePriceAlertForm() {
    this.showPriceAlertForm = false;
    this.editingAlert = null;
  }

  async savePriceAlert() {
    if (!this.priceAlertForm.categoryId) {
      this.showToast('Please select a category', 'warning');
      return;
    }

    if (this.priceAlertForm.floorPrice === null && this.priceAlertForm.ceilingPrice === null) {
      this.showToast('Please set at least floor or ceiling price', 'warning');
      return;
    }

    const category = this.categories.find(c => c.id === this.priceAlertForm.categoryId);
    if (!category) return;

    if (this.editingAlert) {
      // Update existing
      const index = this.priceAlerts.findIndex(a => a.id === this.editingAlert!.id);
      if (index !== -1) {
        this.priceAlerts[index] = {
          ...this.priceAlerts[index],
          categoryId: this.priceAlertForm.categoryId,
          categoryName: category.name,
          floorPrice: this.priceAlertForm.floorPrice,
          ceilingPrice: this.priceAlertForm.ceilingPrice,
          spikeThresholdPercent: this.priceAlertForm.spikeThresholdPercent,
          timeWindowMinutes: this.priceAlertForm.timeWindowMinutes
        };
        this.showToast(`✅ Price alert for ${category.name} updated`, 'success');
      }
    } else {
      // Create new
      const newAlert: PriceAlert = {
        id: `pa-${Date.now()}`,
        categoryId: this.priceAlertForm.categoryId,
        categoryName: category.name,
        floorPrice: this.priceAlertForm.floorPrice,
        ceilingPrice: this.priceAlertForm.ceilingPrice,
        spikeThresholdPercent: this.priceAlertForm.spikeThresholdPercent,
        timeWindowMinutes: this.priceAlertForm.timeWindowMinutes,
        isActive: true
      };
      this.priceAlerts.push(newAlert);
      this.showToast(`✅ Price alert for ${category.name} created`, 'success');
    }

    this.closePriceAlertForm();
  }

  editPriceAlert(alert: PriceAlert) {
    this.editingAlert = alert;
    this.priceAlertForm = {
      categoryId: alert.categoryId,
      floorPrice: alert.floorPrice,
      ceilingPrice: alert.ceilingPrice,
      spikeThresholdPercent: alert.spikeThresholdPercent,
      timeWindowMinutes: alert.timeWindowMinutes
    };
    this.showPriceAlertForm = true;
  }

  async deletePriceAlert(alert: PriceAlert) {
    const alertDialog = await this.alertController.create({
      header: 'Delete Price Alert',
      message: `Remove price monitoring for ${alert.categoryName}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.priceAlerts = this.priceAlerts.filter(a => a.id !== alert.id);
            this.showToast(`❌ Alert for ${alert.categoryName} deleted`, 'warning');
          }
        }
      ]
    });
    await alertDialog.present();
  }

  async toggleAlertStatus(alert: PriceAlert) {
    alert.isActive = !alert.isActive;
    const status = alert.isActive ? 'activated' : 'deactivated';
    this.showToast(`Alert for ${alert.categoryName} ${status}`, alert.isActive ? 'success' : 'warning');
  }

  // ==================== UTILITIES ====================

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }

  getActiveCategories(): number {
    return this.categories.filter(c => c.isActive).length;
  }

  getTotalSubCategories(): number {
    return this.categories.reduce((sum, cat) => sum + cat.subCategories.length, 0);
  }

  getActiveAlerts(): number {
    return this.priceAlerts.filter(a => a.isActive).length;
  }
}
