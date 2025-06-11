
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
