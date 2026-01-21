import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import * as XLSX from 'xlsx';

interface ReportData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeTransporters: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  
  // By Mandi
  mandiStats: MandiStats[];
  
  // By User Role
  buyerCount: number;
  vendorCount: number;
  transporterCount: number;
  
  // Time Series
  dailyOrders: TimeSeriesData[];
  weeklyRevenue: TimeSeriesData[];
  
  // Top Performers
  topBuyers: UserStats[];
  topVendors: UserStats[];
  topTransporters: UserStats[];
  
  // Product Categories
  categoryStats: CategoryStats[];
}

interface MandiStats {
  mandiId: string;
  mandiName: string;
  totalOrders: number;
  revenue: number;
  activeUsers: number;
  averageDeliveryTime: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

interface UserStats {
  userId: string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
}

interface CategoryStats {
  category: string;
  totalOrders: number;
  revenue: number;
  percentage: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  selectedTab: 'overview' | 'mandis' | 'users' | 'orders' | 'revenue' = 'overview';
  dateRange: 'today' | 'week' | 'month' | 'year' = 'month';
  
  isLoading: boolean = false;
  reportData: ReportData | null = null;
  Math = Math; // Make Math available in template
  
  // Date filters
  startDate: string = '';
  endDate: string = '';

  constructor(private http: HttpClient) {
    // Set default date range to current month
    const now = new Date();
    this.endDate = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate = startOfMonth.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadReportData();
  }
  
  loadReportData() {
    this.isLoading = true;
    
    // Mock data for demonstration
    setTimeout(() => {
      this.reportData = {
        totalUsers: 487,
        totalOrders: 3245,
        totalRevenue: 2847500,
        activeTransporters: 156,
        pendingOrders: 48,
        completedOrders: 3105,
        cancelledOrders: 92,
        buyerCount: 245,
        vendorCount: 186,
        transporterCount: 56,
        
        mandiStats: [
          {
            mandiId: 'mandi-001',
            mandiName: 'Azadpur Mandi, Delhi',
            totalOrders: 1245,
            revenue: 1125000,
            activeUsers: 156,
            averageDeliveryTime: 45
          },
          {
            mandiId: 'mandi-002',
            mandiName: 'Mumbai APMC, Vashi',
            totalOrders: 985,
            revenue: 890000,
            activeUsers: 124,
            averageDeliveryTime: 52
          },
          {
            mandiId: 'mandi-003',
            mandiName: 'Bangalore APMC',
            totalOrders: 645,
            revenue: 575000,
            activeUsers: 98,
            averageDeliveryTime: 38
          },
          {
            mandiId: 'mandi-004',
            mandiName: 'Okhla Mandi, Delhi',
            totalOrders: 370,
            revenue: 257500,
            activeUsers: 65,
            averageDeliveryTime: 42
          }
        ],
        
        dailyOrders: this.generateDailyOrders(),
        weeklyRevenue: this.generateWeeklyRevenue(),
        
        topBuyers: [
          { userId: 'buyer-001', name: 'Raj Restaurant', totalOrders: 245, totalRevenue: 285000, rating: 4.8 },
          { userId: 'buyer-002', name: 'Mumbai Mess', totalOrders: 198, totalRevenue: 245000, rating: 4.6 },
          { userId: 'buyer-003', name: 'Delhi Dhaba', totalOrders: 176, totalRevenue: 198000, rating: 4.7 },
          { userId: 'buyer-004', name: 'Bangalore Bites', totalOrders: 165, totalRevenue: 187000, rating: 4.5 },
          { userId: 'buyer-005', name: 'Pune Paratha', totalOrders: 142, totalRevenue: 156000, rating: 4.4 }
        ],
        
        topVendors: [
          { userId: 'vendor-001', name: 'Fresh Vegetables Co.', totalOrders: 567, totalRevenue: 645000, rating: 4.9 },
          { userId: 'vendor-002', name: 'Organic Produce', totalOrders: 489, totalRevenue: 556000, rating: 4.7 },
          { userId: 'vendor-003', name: 'Quality Fruits', totalOrders: 423, totalRevenue: 478000, rating: 4.8 },
          { userId: 'vendor-004', name: 'Farm Direct', totalOrders: 387, totalRevenue: 412000, rating: 4.6 },
          { userId: 'vendor-005', name: 'Green Harvest', totalOrders: 345, totalRevenue: 389000, rating: 4.5 }
        ],
        
        topTransporters: [
          { userId: 'trans-001', name: 'Speedy Logistics', totalOrders: 892, totalRevenue: 267600, rating: 4.8 },
          { userId: 'trans-002', name: 'Fast Track', totalOrders: 765, totalRevenue: 229500, rating: 4.7 },
          { userId: 'trans-003', name: 'Quick Delivery', totalOrders: 698, totalRevenue: 209400, rating: 4.6 },
          { userId: 'trans-004', name: 'Safe Transport', totalOrders: 587, totalRevenue: 176100, rating: 4.5 },
          { userId: 'trans-005', name: 'Express Movers', totalOrders: 523, totalRevenue: 156900, rating: 4.4 }
        ],
        
        categoryStats: [
          { category: 'Vegetables', totalOrders: 1245, revenue: 985000, percentage: 34.6 },
          { category: 'Fruits', totalOrders: 987, revenue: 756000, percentage: 26.5 },
          { category: 'Grains', totalOrders: 645, revenue: 567000, percentage: 19.9 },
          { category: 'Dairy', totalOrders: 368, revenue: 356000, percentage: 12.5 },
          { category: 'Others', totalOrders: 0, revenue: 183500, percentage: 6.5 }
        ]
      };
      
      this.isLoading = false;
    }, 1000);
  }
  
  generateDailyOrders(): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const days = 30;
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const value = Math.floor(80 + Math.random() * 60);
      data.push({
        date: date.toISOString().split('T')[0],
        value: value,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return data;
  }
  
  generateWeeklyRevenue(): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const weeks = 12;
    
    for (let i = weeks - 1; i >= 0; i--) {
      const value = Math.floor(180000 + Math.random() * 90000);
      data.push({
        date: `Week ${weeks - i}`,
        value: value,
        label: `Week ${weeks - i}`
      });
    }
    
    return data;
  }
  
  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
  }
  
  onDateRangeChange(event: any) {
    this.dateRange = event.detail.value;
    this.updateDateRange();
    this.loadReportData();
  }
  
  updateDateRange() {
    const now = new Date();
    this.endDate = now.toISOString().split('T')[0];
    
    switch (this.dateRange) {
      case 'today':
        this.startDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        this.startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        this.startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        this.startDate = yearAgo.toISOString().split('T')[0];
        break;
    }
  }
  
  exportFullReport() {
    if (!this.reportData) return;
    
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    
    // Overview Sheet
    const overviewData = [
      ['Metric', 'Value'],
      ['Total Users', this.reportData.totalUsers],
      ['Total Orders', this.reportData.totalOrders],
      ['Total Revenue', `₹${this.reportData.totalRevenue.toLocaleString()}`],
      ['Active Transporters', this.reportData.activeTransporters],
      ['Pending Orders', this.reportData.pendingOrders],
      ['Completed Orders', this.reportData.completedOrders],
      ['Cancelled Orders', this.reportData.cancelledOrders],
      ['Buyers', this.reportData.buyerCount],
      ['Vendors', this.reportData.vendorCount],
      ['Transporters', this.reportData.transporterCount]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Overview');
    
    // Mandi Stats Sheet
    const mandiData = this.reportData.mandiStats.map(m => ({
      'Mandi': m.mandiName,
      'Total Orders': m.totalOrders,
      'Revenue': m.revenue,
      'Active Users': m.activeUsers,
      'Avg Delivery Time (min)': m.averageDeliveryTime
    }));
    const ws2 = XLSX.utils.json_to_sheet(mandiData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Mandi Statistics');
    
    // Top Buyers Sheet
    const buyerData = this.reportData.topBuyers.map(b => ({
      'Name': b.name,
      'Total Orders': b.totalOrders,
      'Revenue': b.totalRevenue,
      'Rating': b.rating
    }));
    const ws3 = XLSX.utils.json_to_sheet(buyerData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Top Buyers');
    
    // Top Vendors Sheet
    const vendorData = this.reportData.topVendors.map(v => ({
      'Name': v.name,
      'Total Orders': v.totalOrders,
      'Revenue': v.totalRevenue,
      'Rating': v.rating
    }));
    const ws4 = XLSX.utils.json_to_sheet(vendorData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Top Vendors');
    
    // Category Stats Sheet
    const categoryData = this.reportData.categoryStats.map(c => ({
      'Category': c.category,
      'Total Orders': c.totalOrders,
      'Revenue': c.revenue,
      'Percentage': `${c.percentage}%`
    }));
    const ws5 = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, ws5, 'Categories');
    
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `MandiApp_Complete_Report_${timestamp}.xlsx`);
  }
  
  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  
  formatNumber(num: number): string {
    return num.toLocaleString('en-IN');
  }
}
