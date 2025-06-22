
import { SalesData, MarginBand, MonthlyData } from '../types';
import { DynamicsApiResponse } from '../services/dynamicsApiService';

export const transformApiDataToExpectedFormat = (apiData: DynamicsApiResponse) => {
  // Transform API response to match our existing data structure
  // This will need to be adjusted based on your actual API response format
  
  const currentMonth = new Date().getMonth();
  
  // Generate monthly data - adapt this based on your API structure
  const monthlyTrend: MonthlyData[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i <= currentMonth; i++) {
    // This is a placeholder - you'll need to map your actual API data structure
    const monthData = apiData.monthlyData?.[i] || {};
    
    monthlyTrend.push({
      month: months[i],
      sales: monthData.sales || 0,
      gp: monthData.gp || 0,
      totalOrders: monthData.totalOrders || 0,
      salespeople: monthData.salespeople || {
        'John Smith': { sales: 0, gp: 0, orders: 0 },
        'Sarah Johnson': { sales: 0, gp: 0, orders: 0 },
        'Mike Chen': { sales: 0, gp: 0, orders: 0 }
      },
      customers: monthData.customers || {
        'Toyota Motor Thailand': { sales: 0, gp: 0, orders: 0 },
        'Honda Automobile Thailand': { sales: 0, gp: 0, orders: 0 },
        'Isuzu Motors': { sales: 0, gp: 0, orders: 0 }
      }
    });
  }

  // Transform current month data
  const currentMonthData = monthlyTrend[currentMonth] || monthlyTrend[monthlyTrend.length - 1];
  const currentMonth_: SalesData = {
    totalSales: currentMonthData.sales,
    totalGP: currentMonthData.gp,
    totalOrders: currentMonthData.totalOrders,
    averageMargin: currentMonthData.sales > 0 ? (currentMonthData.gp / currentMonthData.sales) * 100 : 0
  };

  // Transform margin bands - handle missing marginBands property
  const marginBands: MarginBand[] = [];
  
  // Check if marginBands exists in the API response
  if (apiData.salesData && Array.isArray(apiData.salesData) && apiData.salesData.length > 0) {
    // Try to extract margin band data from the sales data
    // This is a placeholder - adjust based on your actual API structure
    const salesDataArray = apiData.salesData;
    
    // If your API has margin band data, extract it here
    // For now, providing default structure
    marginBands.push(
      { band: '<10%', orders: 0, value: 0, percentage: 0 },
      { band: '10-20%', orders: 0, value: 0, percentage: 0 },
      { band: '>20%', orders: 0, value: 0, percentage: 0 }
    );
  } else {
    // Default margin bands if no data available
    marginBands.push(
      { band: '<10%', orders: 0, value: 0, percentage: 0 },
      { band: '10-20%', orders: 0, value: 0, percentage: 0 },
      { band: '>20%', orders: 0, value: 0, percentage: 0 }
    );
  }

  return {
    currentMonth: currentMonth_,
    marginBands,
    monthlyTrend
  };
};
