
export interface ManualOrder {
  id: string;
  orderDate: string;
  customerName: string;
  businessUnit: 'Coil' | 'Unit' | 'M&E' | 'HBPM' | 'MKT';
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

export interface BUTargets {
  [businessUnit: string]: {
    monthlyTargets: {
      sales: number[];
      gp: number[];
    };
    annualTargets: {
      sales: number;
      gp: number;
      distribution: 'equal' | 'weighted' | 'custom';
      weights?: number[];
    };
  };
}

export interface EnhancedTargets {
  id?: string; // API ID
  inputMethod: 'monthly' | 'annual';
  rolloverStrategy: 'none' | 'cumulative' | 'quarterly' | 'redistribute';
  globalTargets: boolean; // true = single target, false = per-BU
  businessUnitTargets: BUTargets;
  selectedBusinessUnit: string;
  migrationVersion?: number; // Add migration version tracking
  // Legacy fields for backward compatibility
  monthlyTargets: {
    sales: number[];
    gp: number[];
  };
  annualTargets: {
    sales: number;
    gp: number;
    distribution: 'equal' | 'weighted' | 'custom';
    weights?: number[];
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
  businessUnit: string;
  customerName: string;
  salesperson: string;
}

// User-related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'tester';
  organization_id?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}
