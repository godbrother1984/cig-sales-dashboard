
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
  console.log('=== COMBINING DATA WITH MANUAL ORDERS ===');
  console.log('Business unit filter:', filters.businessUnit);
  console.log('View mode:', viewMode);
  console.log('Selected month:', selectedMonth);
  console.log('Total manual orders before filtering:', manualOrders.length);
  
  try {
    const filteredManualOrders = filterManualOrders(manualOrders, filters, selectedMonth, viewMode);
    
    console.log('Manual orders after filtering:', filteredManualOrders.length);
    console.log('Filtered manual orders by business unit:', filteredManualOrders.reduce((acc, order) => {
      acc[order.businessUnit] = (acc[order.businessUnit] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number }));
    
    const manualTotalSales = filteredManualOrders.reduce((sum, order) => sum + order.orderValue, 0);
    const manualTotalGP = filteredManualOrders.reduce((sum, order) => sum + order.grossProfit, 0);
    const manualOrderCount = filteredManualOrders.length;

    console.log('Manual orders totals:', {
      sales: manualTotalSales,
      gp: manualTotalGP,
      orders: manualOrderCount
    });

    // Ensure monthly trend includes current month even with zero data
    const currentMonthIndex = new Date().getMonth();
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const currentMonthName = monthNames[currentMonthIndex];
    
    let monthlyData = [...dynamicsData.monthlyTrend];
    
    // Check if current month exists in the data, if not add it with zero values
    const currentMonthExists = monthlyData.some(month => month.month.toLowerCase() === currentMonthName);
    if (!currentMonthExists) {
      // Insert current month with zero values at the appropriate position
      const currentMonthData = {
        month: currentMonthName,
        sales: 0,
        gp: 0,
        totalOrders: 0,
        salespeople: {},
        customers: {}
      };
      
      // Insert in the correct chronological position
      monthlyData.splice(currentMonthIndex, 0, currentMonthData);
    }

    let baseData: SalesData;

    console.log('Base dynamics data (current month):', dynamicsData.currentMonth);

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
      const currentMonthData = monthlyData[currentMonthIndex] || { sales: 0, gp: 0, totalOrders: 0, salespeople: {}, customers: {} };
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
      if (currentMonthData && currentMonthData.salespeople[filters.salesperson]) {
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
      if (currentMonthData && currentMonthData.customers[filters.customerName]) {
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

    console.log('Combined totals:', {
      totalSales: combinedTotalSales,
      totalGP: combinedTotalGP,
      totalOrders: combinedTotalOrders,
      averageMargin: combinedAverageMargin
    });

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
      // Fix: Use lowercase month names to match the API data format
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.indexOf(monthData.month.toLowerCase());
      
      console.log(`Processing month: ${monthData.month}, monthIndex: ${monthIndex}`);
      
      // Skip if month index is invalid
      if (monthIndex === -1) {
        console.warn(`Invalid month found: ${monthData.month}`);
        return monthData;
      }
      
      // Get manual orders for this specific month that match the current business unit filter
      const monthManualOrders = manualOrders.filter(order => {
        // Skip orders without valid business unit data
        if (!order || !order.businessUnit) {
          return false;
        }
        
        const orderDate = new Date(order.orderDate);
        const orderMonth = orderDate.getMonth();
        
        // Apply the same business unit filter logic as used in filterManualOrders
        const normalizeBusinessUnit = (businessUnit: string | undefined): string => {
          if (!businessUnit) {
            return 'Coil'; // Default business unit
          }
          
          const mapping: { [key: string]: string } = {
            'coil': 'Coil',
            'unit': 'Unit', 
            'm&e': 'M&E',
            'hbpm': 'HBPM',
            'mkt': 'MKT'
          };
          const normalized = businessUnit.toLowerCase();
          return mapping[normalized] || businessUnit;
        };
        
        const normalizedOrderBU = normalizeBusinessUnit(order.businessUnit);
        const normalizedFilterBU = filters.businessUnit === 'all' ? 'all' : normalizeBusinessUnit(filters.businessUnit);
        const businessUnitMatch = normalizedFilterBU === 'all' || normalizedOrderBU === normalizedFilterBU;
        
        return orderMonth === monthIndex && businessUnitMatch;
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
  } catch (error) {
    console.error('Error in combineDataWithManualOrders:', error);
    // Return a fallback structure to prevent the app from breaking
    return {
      currentMonth: {
        totalSales: 0,
        totalGP: 0,
        totalOrders: 0,
        averageMargin: 0
      },
      targets: targets,
      marginBands: dynamicsData.marginBands || [],
      monthlyTrend: dynamicsData.monthlyTrend || []
    };
  }
};
