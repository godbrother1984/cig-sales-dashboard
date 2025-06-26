
import { MonthlyData, ManualOrder, DashboardFilters, SalesData, MarginBand } from '../types';
import { getQuarterMonths } from './quarterUtils';
import { filterManualOrders } from './dataFiltering';

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

  // The Dynamics data has already been filtered by business unit in the transformer
  // So we use it directly without additional business unit filtering
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

  // Apply salesperson and customer filters (only for monthly view)
  // Business unit filtering is already applied at the API data level
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
