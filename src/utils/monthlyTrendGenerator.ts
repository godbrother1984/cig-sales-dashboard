
import { MonthlyData } from '../types';
import { ProcessedInvoiceItem, ProcessedSalesOrderItem } from './apiDataProcessor';

const MONTH_ORDER = {
  'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
  'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
};

export const getAvailableMonths = (
  invoiceData: ProcessedInvoiceItem[], 
  salesOrderData: ProcessedSalesOrderItem[]
): string[] => {
  const availableMonths = new Set<string>();
  
  invoiceData.forEach(item => {
    if (item && item.month && typeof item.month === 'string') {
      availableMonths.add(item.month.toLowerCase());
    }
  });
  
  salesOrderData.forEach(item => {
    if (item && item.month && typeof item.month === 'string') {
      availableMonths.add(item.month.toLowerCase());
    }
  });
  
  const availableMonthsArray = Array.from(availableMonths);
  console.log('Available months in filtered data:', availableMonthsArray);
  
  return availableMonthsArray.sort((a, b) => {
    const orderA = MONTH_ORDER[a as keyof typeof MONTH_ORDER] || 0;
    const orderB = MONTH_ORDER[b as keyof typeof MONTH_ORDER] || 0;
    return orderA - orderB;
  });
};

export const findLatestMonth = (availableMonths: string[]): string => {
  let latestMonth = '';
  let latestMonthOrder = 0;
  
  availableMonths.forEach(month => {
    const order = MONTH_ORDER[month as keyof typeof MONTH_ORDER];
    if (order && order > latestMonthOrder) {
      latestMonthOrder = order;
      latestMonth = month;
    }
  });
  
  console.log(`Latest month found: ${latestMonth} (order: ${latestMonthOrder})`);
  
  if (!latestMonth && availableMonths.length > 0) {
    latestMonth = availableMonths[0];
    console.log(`Using first available month as fallback: ${latestMonth}`);
  }
  
  return latestMonth;
};

export const generateMonthlyTrend = (
  invoiceData: ProcessedInvoiceItem[],
  salesOrderData: ProcessedSalesOrderItem[],
  availableMonths: string[]
): MonthlyData[] => {
  console.log('=== GENERATING MONTHLY TREND ===');
  console.log('Available months:', availableMonths);
  
  return availableMonths.map(monthKey => {
    console.log(`Processing monthly trend for ${monthKey}:`);
    
    const invoiceMonthData = invoiceData
      .filter(item => item && item.month && item.month.toLowerCase() === monthKey)
      .reduce((acc, item) => {
        if (!item) return acc;
        console.log(`  Invoice: BU=${item.businessUnit}, Amount=${item.total_inv_amount}, GP=${item.gross_profit}, Orders=${item.total_inv}`);
        return {
          total_inv_amount: acc.total_inv_amount + (Number(item.total_inv_amount) || 0),
          gross_profit: acc.gross_profit + (Number(item.gross_profit) || 0),
          total_inv: acc.total_inv + (Number(item.total_inv) || 0)
        };
      }, { total_inv_amount: 0, gross_profit: 0, total_inv: 0 });

    const salesOrderMonthData = salesOrderData
      .filter(item => item && item.month && item.month.toLowerCase() === monthKey)
      .reduce((acc, item) => {
        if (!item) return acc;
        console.log(`  Sales Order: BU=${item.businessUnit}, Amount=${item.total_so_amount}, GP=${item.gross_profit}, Orders=${item.total_so}`);
        return {
          total_so_amount: acc.total_so_amount + (Number(item.total_so_amount) || 0),
          gross_profit: acc.gross_profit + (Number(item.gross_profit) || 0),
          total_so: acc.total_so + (Number(item.total_so) || 0)
        };
      }, { total_so_amount: 0, gross_profit: 0, total_so: 0 });
    
    const totalSales = (Number(invoiceMonthData.total_inv_amount) || 0) + (Number(salesOrderMonthData.total_so_amount) || 0);
    const totalGP = (Number(invoiceMonthData.gross_profit) || 0) + (Number(salesOrderMonthData.gross_profit) || 0);
    const totalOrders = (Number(invoiceMonthData.total_inv) || 0) + (Number(salesOrderMonthData.total_so) || 0);
    
    console.log(`  ${monthKey} totals: Sales=${totalSales}, GP=${totalGP}, Orders=${totalOrders}`);
    
    return {
      month: monthKey.charAt(0).toUpperCase() + monthKey.slice(1),
      sales: totalSales,
      gp: totalGP,
      totalOrders: totalOrders,
      salespeople: {
        'John Smith': { 
          sales: totalSales * 0.3, 
          gp: totalGP * 0.3, 
          orders: Math.floor(totalOrders * 0.3) 
        },
        'Sarah Johnson': { 
          sales: totalSales * 0.4, 
          gp: totalGP * 0.4, 
          orders: Math.floor(totalOrders * 0.4) 
        },
        'Mike Chen': { 
          sales: totalSales * 0.3, 
          gp: totalGP * 0.3, 
          orders: Math.floor(totalOrders * 0.3) 
        }
      },
      customers: {
        'Toyota Motor Thailand': { 
          sales: totalSales * 0.35, 
          gp: totalGP * 0.35, 
          orders: Math.floor(totalOrders * 0.35) 
        },
        'Honda Automobile Thailand': { 
          sales: totalSales * 0.35, 
          gp: totalGP * 0.35, 
          orders: Math.floor(totalOrders * 0.35) 
        },
        'Isuzu Motors': { 
          sales: totalSales * 0.3, 
          gp: totalGP * 0.3, 
          orders: Math.floor(totalOrders * 0.3) 
        }
      }
    };
  });
};
