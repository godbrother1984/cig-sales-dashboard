
import { SalesData, MarginBand, MonthlyData } from '../types';
import { DynamicsApiResponse } from '../services/dynamicsApiService';

export const transformApiDataToExpectedFormat = (apiData: DynamicsApiResponse) => {
  console.log('Transforming API data:', apiData);
  
  // Extract invoice data (use invoice data as primary source)
  const invoiceData = apiData.datas?.invoice || [];
  const salesOrderData = apiData.datas?.sales_order || [];
  
  const currentMonth = new Date().getMonth();
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  // Transform monthly data from API response
  const monthlyTrend: MonthlyData[] = [];
  
  for (let i = 0; i <= Math.min(currentMonth, invoiceData.length - 1); i++) {
    const monthKey = months[i];
    const invoiceMonth = invoiceData.find(item => item.month === monthKey);
    const salesMonth = salesOrderData.find(item => item.month === monthKey);
    
    if (invoiceMonth) {
      monthlyTrend.push({
        month: monthKey.charAt(0).toUpperCase() + monthKey.slice(1), // Capitalize first letter
        sales: invoiceMonth.total_inv_amount || 0,
        gp: invoiceMonth.gm_inv || 0,
        totalOrders: invoiceMonth.total_inv || 0,
        salespeople: {
          'John Smith': { sales: (invoiceMonth.total_inv_amount || 0) * 0.3, gp: (invoiceMonth.gm_inv || 0) * 0.3, orders: Math.floor((invoiceMonth.total_inv || 0) * 0.3) },
          'Sarah Johnson': { sales: (invoiceMonth.total_inv_amount || 0) * 0.4, gp: (invoiceMonth.gm_inv || 0) * 0.4, orders: Math.floor((invoiceMonth.total_inv || 0) * 0.4) },
          'Mike Chen': { sales: (invoiceMonth.total_inv_amount || 0) * 0.3, gp: (invoiceMonth.gm_inv || 0) * 0.3, orders: Math.floor((invoiceMonth.total_inv || 0) * 0.3) }
        },
        customers: {
          'Toyota Motor Thailand': { sales: (invoiceMonth.total_inv_amount || 0) * 0.35, gp: (invoiceMonth.gm_inv || 0) * 0.35, orders: Math.floor((invoiceMonth.total_inv || 0) * 0.35) },
          'Honda Automobile Thailand': { sales: (invoiceMonth.total_inv_amount || 0) * 0.35, gp: (invoiceMonth.gm_inv || 0) * 0.35, orders: Math.floor((invoiceMonth.total_inv || 0) * 0.35) },
          'Isuzu Motors': { sales: (invoiceMonth.total_inv_amount || 0) * 0.3, gp: (invoiceMonth.gm_inv || 0) * 0.3, orders: Math.floor((invoiceMonth.total_inv || 0) * 0.3) }
        }
      });
    }
  }

  // Get current month data for summary
  const currentMonthData = monthlyTrend[Math.min(currentMonth, monthlyTrend.length - 1)] || {
    sales: 0, gp: 0, totalOrders: 0
  };
  
  const currentMonth_: SalesData = {
    totalSales: currentMonthData.sales,
    totalGP: currentMonthData.gp,
    totalOrders: currentMonthData.totalOrders,
    averageMargin: currentMonthData.sales > 0 ? (currentMonthData.gp / currentMonthData.sales) * 100 : 0
  };

  // Transform margin bands from current month invoice data
  const marginBands: MarginBand[] = [];
  const currentInvoiceData = invoiceData[Math.min(currentMonth, invoiceData.length - 1)];
  
  if (currentInvoiceData) {
    const totalValue = currentInvoiceData.total_inv_amount || 0;
    const totalOrders = currentInvoiceData.total_inv || 0;
    
    // Calculate approximate values for each margin band
    const below10Orders = currentInvoiceData.inv_margin_below_10 || 0;
    const band10to20Orders = currentInvoiceData.inv_margin_10_to_20 || 0;
    const above20Orders = currentInvoiceData.inv_margin_above_20 || 0;
    
    const below10Value = totalValue * (below10Orders / totalOrders);
    const band10to20Value = totalValue * (band10to20Orders / totalOrders);
    const above20Value = totalValue * (above20Orders / totalOrders);
    
    marginBands.push(
      { 
        band: '<10%', 
        orders: below10Orders, 
        value: below10Value, 
        percentage: totalValue > 0 ? (below10Value / totalValue) * 100 : 0 
      },
      { 
        band: '10-20%', 
        orders: band10to20Orders, 
        value: band10to20Value, 
        percentage: totalValue > 0 ? (band10to20Value / totalValue) * 100 : 0 
      },
      { 
        band: '>20%', 
        orders: above20Orders, 
        value: above20Value, 
        percentage: totalValue > 0 ? (above20Value / totalValue) * 100 : 0 
      }
    );
  } else {
    // Default margin bands if no data available
    marginBands.push(
      { band: '<10%', orders: 0, value: 0, percentage: 0 },
      { band: '10-20%', orders: 0, value: 0, percentage: 0 },
      { band: '>20%', orders: 0, value: 0, percentage: 0 }
    );
  }

  console.log('Transformed data:', { currentMonth: currentMonth_, marginBands, monthlyTrend });

  return {
    currentMonth: currentMonth_,
    marginBands,
    monthlyTrend
  };
};
