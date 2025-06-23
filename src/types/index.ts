export interface ManualOrder {
  id: string;
  orderDate: string;
  customerName: string;
  productGroup: 'HBPM' | 'M&E';
  orderValue: number;
  grossMargin: number;
  grossProfit: number;
  salesperson: string;
}

export interface SalesData {
  totalSales: number;
  totalGP: number;
  totalOrders: number;
  averageMargin: number;
}

export interface MarginBand {
  band: string;
  orders: number;
  value: number;
  percentage: number;
}

export interface TrendData {
  month: string;
  sales: number;
  gp: number;
}

export interface MonthlyData {
  month: string;
  sales: number;
  gp: number;
  totalOrders: number;
  salespeople: Record<string, { sales: number; gp: number; orders: number }>;
  customers: Record<string, { sales: number; gp: number; orders: number }>;
}

export interface EnhancedTargets {
  inputMethod: 'monthly' | 'annual';
  rolloverStrategy: 'none' | 'cumulative' | 'quarterly' | 'redistribute';
  monthlyTargets: {
    sales: number[];  // 12 months
    gp: number[];     // 12 months
  };
  annualTargets: {
    sales: number;
    gp: number;
    distribution: 'equal' | 'weighted' | 'custom';
    weights?: number[]; // for custom distribution
  };
}

export interface MonthlyTargetAnalysis {
  month: number;
  name: string;
  salesTarget: number;
  gpTarget: number;
  salesActual: number;
  gpActual: number;
  salesVariance: number;
  gpVariance: number;
  salesAchievement: number;
  gpAchievement: number;
}

export interface Targets {
  monthlySales: number;
  monthlyGP: number;
  quarterlySales: number;
  quarterlyGP: number;
  ytdSales: number;
  ytdGP: number;
}

export interface DashboardFilters {
  productGroup: string;
  customerName: string;
  salesperson: string;
}
