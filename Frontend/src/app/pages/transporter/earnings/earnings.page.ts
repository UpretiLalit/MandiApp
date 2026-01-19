import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface EarningRecord {
  date: string;
  deliveries: number;
  baseAmount: number;
  fuelSurcharge: number;
  bonus: number;
  totalEarnings: number;
}

interface DailyStats {
  deliveriesCompleted: number;
  totalDistance: number;
  totalEarnings: number;
  avgPerDelivery: number;
}

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.page.html',
  styleUrls: ['./earnings.page.scss'],
})
export class EarningsPage implements OnInit {
  selectedPeriod: 'daily' | 'weekly' | 'monthly' = 'daily';
  earningsData: EarningRecord[] = [];
  
  // Summary Stats
  todayStats: DailyStats = {
    deliveriesCompleted: 0,
    totalDistance: 0,
    totalEarnings: 0,
    avgPerDelivery: 0
  };
  
  weeklyTotal: number = 0;
  monthlyTotal: number = 0;
  
  // Chart data (simplified)
  chartLabels: string[] = [];
  chartValues: number[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadEarnings();
  }

  loadEarnings() {
    // Mock data - replace with API call
    const mockEarnings: EarningRecord[] = [
      {
        date: '2026-01-13',
        deliveries: 8,
        baseAmount: 2000,
        fuelSurcharge: 240,
        bonus: 100,
        totalEarnings: 2340
      },
      {
        date: '2026-01-12',
        deliveries: 6,
        baseAmount: 1500,
        fuelSurcharge: 180,
        bonus: 0,
        totalEarnings: 1680
      },
      {
        date: '2026-01-11',
        deliveries: 7,
        baseAmount: 1750,
        fuelSurcharge: 210,
        bonus: 50,
        totalEarnings: 2010
      },
      {
        date: '2026-01-10',
        deliveries: 5,
        baseAmount: 1250,
        fuelSurcharge: 150,
        bonus: 0,
        totalEarnings: 1400
      },
      {
        date: '2026-01-09',
        deliveries: 9,
        baseAmount: 2250,
        fuelSurcharge: 270,
        bonus: 150,
        totalEarnings: 2670
      },
      {
        date: '2026-01-08',
        deliveries: 7,
        baseAmount: 1750,
        fuelSurcharge: 210,
        bonus: 0,
        totalEarnings: 1960
      },
      {
        date: '2026-01-07',
        deliveries: 6,
        baseAmount: 1500,
        fuelSurcharge: 180,
        bonus: 100,
        totalEarnings: 1780
      }
    ];
    
    this.earningsData = mockEarnings;
    this.calculateStats();
    this.updateChartData();
  }

  calculateStats() {
    // Today's stats (first record)
    const today = this.earningsData[0];
    this.todayStats = {
      deliveriesCompleted: today.deliveries,
      totalDistance: today.deliveries * 15, // Mock: avg 15km per delivery
      totalEarnings: today.totalEarnings,
      avgPerDelivery: Math.round(today.totalEarnings / today.deliveries)
    };
    
    // Weekly total (last 7 days)
    this.weeklyTotal = this.earningsData
      .slice(0, 7)
      .reduce((sum, day) => sum + day.totalEarnings, 0);
    
    // Monthly total (mock - would need more data)
    this.monthlyTotal = this.weeklyTotal * 4; // Approximate
  }

  updateChartData() {
    this.chartLabels = this.earningsData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }).reverse();
    
    this.chartValues = this.earningsData.map(d => d.totalEarnings).reverse();
  }

  changePeriod(period: 'daily' | 'weekly' | 'monthly') {
    this.selectedPeriod = period;
    // Reload data based on period
    this.loadEarnings();
  }

  getEarningsForPeriod(): EarningRecord[] {
    switch (this.selectedPeriod) {
      case 'daily':
        return this.earningsData.slice(0, 7);
      case 'weekly':
        // Group by week
        return this.groupByWeek(this.earningsData);
      case 'monthly':
        // Group by month
        return this.groupByMonth(this.earningsData);
      default:
        return this.earningsData;
    }
  }

  groupByWeek(data: EarningRecord[]): EarningRecord[] {
    // Simplified - just return weekly summary
    return [{
      date: 'Week of Jan 7-13',
      deliveries: data.reduce((sum, d) => sum + d.deliveries, 0),
      baseAmount: data.reduce((sum, d) => sum + d.baseAmount, 0),
      fuelSurcharge: data.reduce((sum, d) => sum + d.fuelSurcharge, 0),
      bonus: data.reduce((sum, d) => sum + d.bonus, 0),
      totalEarnings: data.reduce((sum, d) => sum + d.totalEarnings, 0)
    }];
  }

  groupByMonth(data: EarningRecord[]): EarningRecord[] {
    // Simplified - just return monthly summary
    return [{
      date: 'January 2026',
      deliveries: data.reduce((sum, d) => sum + d.deliveries, 0),
      baseAmount: data.reduce((sum, d) => sum + d.baseAmount, 0),
      fuelSurcharge: data.reduce((sum, d) => sum + d.fuelSurcharge, 0),
      bonus: data.reduce((sum, d) => sum + d.bonus, 0),
      totalEarnings: data.reduce((sum, d) => sum + d.totalEarnings, 0)
    }];
  }

  getDateLabel(date: string): string {
    if (this.selectedPeriod === 'weekly' || this.selectedPeriod === 'monthly') {
      return date;
    }
    
    const d = new Date(date);
    const today = new Date();
    
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return d.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  }

  viewDetails(earning: EarningRecord) {
    // Navigate to detailed breakdown
    console.log('View details for:', earning);
  }

  requestPayout() {
    // Navigate to payout request page
    console.log('Request payout');
  }
}
