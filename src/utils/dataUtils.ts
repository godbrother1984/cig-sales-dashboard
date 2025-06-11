import { MonthlyData, ManualOrder, DashboardFilters, SalesData, MarginBand, TrendData } from '../types';

export const getQuarterBounds = (month: number) => {
  if (month <= 2) return { start: 0, end: 2, quarter: 'Q1' };
  if (month <= 5) return { start: 3, end: 5, quarter: 'Q2' };
  if (month <= 8) return { start: 6, end: 8, quarter: 'Q3' };
  return { start: 9, end: 11, quarter: 'Q4' };
};

export const getQuarterMonths = (month: number) => {
  const bounds = getQuarterBounds(month);
  return { start: bounds.start, end: Math.min(bounds.end, month) };
};

export const getSampleDynamicsData = (): { 
  currentMonth: SalesData; 
  marginBands: MarginBand[]; 
  monthlyTrend: MonthlyData[] 
} => {
  const monthlyData: MonthlyData[] = [
    { 
      month: 'Jan',
      sales: 2900000, 
      gp: 725000, 
      totalOrders: 145,
      salespeople: {
        'John Smith': { sales: 1200000, gp: 300000, orders: 58 },
        'Sarah Johnson': { sales: 980000, gp: 245000, orders: 47 },
        'Mike Chen': { sales: 720000, gp: 180000, orders: 40 }
      },
      customers: {
        'Toyota Motor Thailand': { sales: 1450000, gp: 362500, orders: 72 },
        'Honda Automobile Thailand': { sales: 870000, gp: 217500, orders: 43 },
        'Isuzu Motors': { sales: 580000, gp: 145000, orders: 30 }
      }
    },
    { 
      month: 'Feb',
      sales: 3100000, 
      gp: 806000, 
      totalOrders: 156,
      salespeople: {
        'John Smith': { sales: 1300000, gp: 338000, orders: 62 },
        'Sarah Johnson': { sales: 1050000, gp: 273000, orders: 52 },
        'Mike Chen': { sales: 750000, gp: 195000, orders: 42 }
      },
      customers: {
        'Toyota Motor Thailand': { sales: 1550000, gp: 403000, orders: 78 },
        'Honda Automobile Thailand': { sales: 930000, gp: 242000, orders: 46 },
        'Isuzu Motors': { sales: 620000, gp: 161000, orders: 32 }
      }
    },
    { 
      month: 'Mar',
      sales: 2750000, 
      gp: 577500, 
      totalOrders: 138,
      salespeople: {
        'John Smith': { sales: 1150000, gp: 241500, orders: 55 },
        'Sarah Johnson': { sales: 935000, gp: 196350, orders: 47 },
        'Mike Chen': { sales: 665000, gp: 139650, orders: 36 }
      },
      customers: {
        'Toyota Motor Thailand': { sales: 1375000, gp: 288750, orders: 69 },
        'Honda Automobile Thailand': { sales: 825000, gp: 173250, orders: 41 },
        'Isuzu Motors': { sales: 550000, gp: 115500, orders: 28 }
      }
    },
    { 
      month: 'Apr',
      sales: 3350000, 
      gp: 871000, 
      totalOrders: 168,
      salespeople: {
        'John Smith': { sales: 1407500, gp: 365950, orders: 67 },
        'Sarah Johnson': { sales: 1140000, gp: 296400, orders: 57 },
        'Mike Chen': { sales: 802500, gp: 208650, orders: 44 }
      },
      customers: {
        'Toyota Motor Thailand': { sales: 1675000, gp: 435500, orders: 84 },
        'Honda Automobile Thailand': { sales: 1005000, gp: 261300, orders: 50 },
        'Isuzu Motors': { sales: 670000, gp: 174200, orders: 34 }
      }
    },
    { 
      month: 'May',
      sales: 2850000, 
      gp: 627000, 
      totalOrders: 156,
      salespeople: {
        'John Smith': { sales: 1197000, gp: 263340, orders: 62 },
        'Sarah Johnson': { sales: 969000, gp: 213180, orders: 52 },
        'Mike Chen': { sales: 684000, gp: 150480, orders: 42 }
      },
      customers: {
        'Toyota Motor Thailand': { sales: 1425000, gp: 313500, orders: 78 },
        'Honda Automobile Thailand': { sales: 855000, gp: 188100, orders: 46 },
        'Isuzu Motors': { sales: 570000, gp: 125400, orders: 32 }
      }
    }
  ];

  return {
    currentMonth: {
      totalSales: 0,
      totalGP: 0,
      totalOrders: 0,
      averageMargin: 0
    },
    marginBands: [
      { band: '<10%', orders: 23, value: 456000, percentage: 16.0 },
      { band: '10-20%', orders: 67, value: 1824000, percentage: 64.0 },
      { band: '>20%', orders: 66, value: 570000, percentage: 20.0 }
    ],
    monthlyTrend: monthlyData
  };
};

export const filterManualOrders = (
  orders: ManualOrder[], 
  filters: DashboardFilters, 
  currentMonth: number, 
  viewMode: string
): ManualOrder[] => {
  return orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    const orderMonth = orderDate.getMonth();
    
    let dateMatch = false;
    if (viewMode === 'ytd') {
      dateMatch = orderMonth <= currentMonth;
    } else if (viewMode === 'qtd') {
      const quarterBounds = getQuarterMonths(currentMonth);
      dateMatch = orderMonth >= quarterBounds.start && orderMonth <= quarterBounds.end;
    } else {
      dateMatch = orderMonth === currentMonth;
    }
    
    const productGroupMatch = filters.productGroup === 'all' || 
      order.productGroup === filters.productGroup;
    const customerMatch = filters.customerName === 'all' || 
      order.customerName === filters.customerName;
    const salespersonMatch = filters.salesperson === 'all' || 
      order.salesperson === filters.salesperson;
    
    return dateMatch && productGroupMatch && customerMatch && salespersonMatch;
  });
};

export const combineDataWithManualOrders = (
  dynamicsData: { currentMonth: SalesData; marginBands: MarginBand[]; monthlyTrend: MonthlyData[] },
  manualOrders: ManualOrder[],
  filters: DashboardFilters,
  selectedMonth: number,
  viewMode: string,
  targets: any
) => {
  const filteredManualOrders = filterManualOrders(manualOrders, filters, selectedMonth, viewMode);
  
  const manualTotalSales = filteredManualOrders.reduce((sum, order) => sum + order.orderValue, 0);
  const manualTotalGP = filteredManualOrders.reduce((sum, order) => sum + order.grossProfit, 0);
  const manualOrderCount = filteredManualOrders.length;

  // Get base dynamics data for the selected month/QTD/YTD
  const monthlyData = dynamicsData.monthlyTrend;
  let baseData: SalesData;

  if (viewMode === 'ytd') {
    const ytdData = monthlyData.slice(0, selectedMonth + 1).reduce((acc, month) => {
      acc.totalSales += month.sales;
      acc.totalGP += month.gp;
      acc.totalOrders += month.totalOrders;
      return acc;
    }, { totalSales: 0, totalGP: 0, totalOrders: 0 });
    
    baseData = {
      ...ytdData,
      averageMargin: ytdData.totalSales > 0 ? (ytdData.totalGP / ytdData.totalSales) * 100 : 0
    };
  } else if (viewMode === 'qtd') {
    const quarterBounds = getQuarterMonths(selectedMonth);
    const qtdData = monthlyData.slice(quarterBounds.start, quarterBounds.end + 1).reduce((acc, month) => {
      acc.totalSales += month.sales;
      acc.totalGP += month.gp;
      acc.totalOrders += month.totalOrders;
      return acc;
    }, { totalSales: 0, totalGP: 0, totalOrders: 0 });
    
    baseData = {
      ...qtdData,
      averageMargin: qtdData.totalSales > 0 ? (qtdData.totalGP / qtdData.totalSales) * 100 : 0
    };
  } else {
    const currentMonthIndex = Math.min(selectedMonth, monthlyData.length - 1);
    const currentMonthData = monthlyData[currentMonthIndex];
    baseData = {
      totalSales: currentMonthData.sales,
      totalGP: currentMonthData.gp,
      totalOrders: currentMonthData.totalOrders,
      averageMargin: currentMonthData.sales > 0 ? (currentMonthData.gp / currentMonthData.sales) * 100 : 0
    };
  }

  // Apply additional filters (salesperson, customer) - only for monthly view
  if (filters.salesperson !== 'all' && viewMode === 'monthly') {
    const currentMonthIndex = Math.min(selectedMonth, monthlyData.length - 1);
    const currentMonthData = monthlyData[currentMonthIndex];
    if (currentMonthData.salespeople[filters.salesperson]) {
      const salespersonData = currentMonthData.salespeople[filters.salesperson];
      baseData = {
        totalSales: salespersonData.sales,
        totalGP: salespersonData.gp,
        totalOrders: salespersonData.orders,
        averageMargin: salespersonData.sales > 0 ? (salespersonData.gp / salespersonData.sales) * 100 : 0
      };
    }
  }

  if (filters.customerName !== 'all' && viewMode === 'monthly') {
    const currentMonthIndex = Math.min(selectedMonth, monthlyData.length - 1);
    const currentMonthData = monthlyData[currentMonthIndex];
    if (currentMonthData.customers[filters.customerName]) {
      const customerData = currentMonthData.customers[filters.customerName];
      baseData = {
        totalSales: customerData.sales,
        totalGP: customerData.gp,
        totalOrders: customerData.orders,
        averageMargin: customerData.sales > 0 ? (customerData.gp / customerData.sales) * 100 : 0
      };
    }
  }

  const combinedTotalSales = baseData.totalSales + manualTotalSales;
  const combinedTotalGP = baseData.totalGP + manualTotalGP;
  const combinedTotalOrders = baseData.totalOrders + manualOrderCount;
  const combinedAverageMargin = combinedTotalSales > 0 ? (combinedTotalGP / combinedTotalSales) * 100 : 0;

  // Update margin bands to include manual orders
  const updatedMarginBands = [...dynamicsData.marginBands];
  
  filteredManualOrders.forEach(order => {
    let bandIndex;
    if (order.grossMargin < 10) {
      bandIndex = 0;
    } else if (order.grossMargin <= 20) {
      bandIndex = 1;
    } else {
      bandIndex = 2;
    }
    
    updatedMarginBands[bandIndex].orders += 1;
    updatedMarginBands[bandIndex].value += order.orderValue;
  });

  const totalMarginBandValue = updatedMarginBands.reduce((sum, band) => sum + band.value, 0);
  updatedMarginBands.forEach(band => {
    band.percentage = totalMarginBandValue > 0 ? (band.value / totalMarginBandValue) * 100 : 0;
  });

  // Update monthly trend to include manual orders
  const updatedMonthlyTrend = monthlyData.map(monthData => {
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthData.month);
    
    // Get manual orders for this specific month
    const monthManualOrders = manualOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getMonth() === monthIndex;
    });
    
    const monthManualSales = monthManualOrders.reduce((sum, order) => sum + order.orderValue, 0);
    const monthManualGP = monthManualOrders.reduce((sum, order) => sum + order.grossProfit, 0);
    
    return {
      ...monthData,
      sales: monthData.sales + monthManualSales,
      gp: monthData.gp + monthManualGP
    };
  });

  return {
    currentMonth: {
      totalSales: combinedTotalSales,
      totalGP: combinedTotalGP,
      totalOrders: combinedTotalOrders,
      averageMargin: combinedAverageMargin
    },
    targets: targets,
    marginBands: updatedMarginBands,
    monthlyTrend: updatedMonthlyTrend
  };
};
