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

const getCurrentMonth = () => new Date().getMonth();

const generateMonthData = (monthIndex: number): MonthlyData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Base values with some variation per month
  const baseValues = [
    { sales: 2900000, gp: 725000, orders: 145 },
    { sales: 3100000, gp: 806000, orders: 156 },
    { sales: 2750000, gp: 577500, orders: 138 },
    { sales: 3350000, gp: 871000, orders: 168 },
    { sales: 2850000, gp: 627000, orders: 156 },
    { sales: 3200000, gp: 800000, orders: 160 },
    { sales: 3100000, gp: 775000, orders: 155 },
    { sales: 2950000, gp: 737500, orders: 148 },
    { sales: 3400000, gp: 850000, orders: 170 },
    { sales: 3250000, gp: 812500, orders: 163 },
    { sales: 3150000, gp: 787500, orders: 158 },
    { sales: 3300000, gp: 825000, orders: 165 }
  ];

  const monthData = baseValues[monthIndex];
  
  return {
    month: months[monthIndex],
    sales: monthData.sales,
    gp: monthData.gp,
    totalOrders: monthData.orders,
    salespeople: {
      'John Smith': { 
        sales: Math.round(monthData.sales * 0.41), 
        gp: Math.round(monthData.gp * 0.41), 
        orders: Math.round(monthData.orders * 0.4) 
      },
      'Sarah Johnson': { 
        sales: Math.round(monthData.sales * 0.34), 
        gp: Math.round(monthData.gp * 0.34), 
        orders: Math.round(monthData.orders * 0.33) 
      },
      'Mike Chen': { 
        sales: Math.round(monthData.sales * 0.25), 
        gp: Math.round(monthData.gp * 0.25), 
        orders: Math.round(monthData.orders * 0.27) 
      }
    },
    customers: {
      'Toyota Motor Thailand': { 
        sales: Math.round(monthData.sales * 0.5), 
        gp: Math.round(monthData.gp * 0.5), 
        orders: Math.round(monthData.orders * 0.5) 
      },
      'Honda Automobile Thailand': { 
        sales: Math.round(monthData.sales * 0.3), 
        gp: Math.round(monthData.gp * 0.3), 
        orders: Math.round(monthData.orders * 0.29) 
      },
      'Isuzu Motors': { 
        sales: Math.round(monthData.sales * 0.2), 
        gp: Math.round(monthData.gp * 0.2), 
        orders: Math.round(monthData.orders * 0.21) 
      }
    }
  };
};

export const getSampleDynamicsData = (): { 
  currentMonth: SalesData; 
  marginBands: MarginBand[]; 
  monthlyTrend: MonthlyData[] 
} => {
  const currentMonth = getCurrentMonth();
  const monthlyData: MonthlyData[] = [];
  
  // Generate data for all months up to and including current month
  for (let i = 0; i <= currentMonth; i++) {
    monthlyData.push(generateMonthData(i));
  }

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
