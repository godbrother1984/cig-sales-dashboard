
import { SalesData, MarginBand, MonthlyData } from '../types';
import { DynamicsApiResponse } from '../services/dynamicsApiService';

export const transformApiDataToExpectedFormat = (apiData: DynamicsApiResponse) => {
  console.log('Transforming API data:', apiData);
  
  // Handle the nested structure - get invoice and sales order data
  const invoiceData = apiData.datas?.invoice || [];
  const salesOrderData = apiData.datas?.sales_order || [];
  
  console.log('Invoice data:', invoiceData);
  console.log('Sales order data:', salesOrderData);
  
  const currentMonth = new Date().getMonth();
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  // Transform monthly data from API response
  const monthlyTrend: MonthlyData[] = [];
  
  for (let i = 0; i <= Math.min(currentMonth, 11); i++) {
    const monthKey = months[i];
    
    // Find data for this month in both invoice and sales order arrays
    const invoiceMonthData = invoiceData.find(item => item.month === monthKey);
    const salesOrderMonthData = salesOrderData.find(item => item.month === monthKey);
    
    // Combine invoice and sales order data
    const totalSales = (invoiceMonthData?.total_inv_amount || 0) + (salesOrderMonthData?.total_so_amount || 0);
    const totalGP = (invoiceMonthData?.gm_inv || 0) + (salesOrderMonthData?.gm_so || 0);
    const totalOrders = (invoiceMonthData?.total_inv || 0) + (salesOrderMonthData?.total_so || 0);
    
    if (totalSales > 0 || totalGP > 0 || totalOrders > 0) {
      monthlyTrend.push({
        month: monthKey.charAt(0).toUpperCase() + monthKey.slice(1), // Capitalize first letter
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

  // Transform margin bands from current month data
  const marginBands: MarginBand[] = [];
  const currentInvoiceData = invoiceData[Math.min(currentMonth, invoiceData.length - 1)];
  
  if (currentInvoiceData) {
    const totalValue = currentInvoiceData.total_inv_amount || 0;
    const totalOrders = currentInvoiceData.total_inv || 0;
    
    const below10Orders = currentInvoiceData.inv_margin_below_10 || 0;
    const band10to20Orders = currentInvoiceData.inv_margin_10_to_20 || 0;
    const above20Orders = currentInvoiceData.inv_margin_above_20 || 0;
    
    const below10Value = totalOrders > 0 ? totalValue * (below10Orders / totalOrders) : 0;
    const band10to20Value = totalOrders > 0 ? totalValue * (band10to20Orders / totalOrders) : 0;
    const above20Value = totalOrders > 0 ? totalValue * (above20Orders / totalOrders) : 0;
    
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

export const getEmptyDataStructure = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    currentMonth: {
      totalSales: 0,
      totalGP: 0,
      totalOrders: 0,
      averageMargin: 0
    },
    marginBands: [
      { band: '<10%', orders: 0, value: 0, percentage: 0 },
      { band: '10-20%', orders: 0, value: 0, percentage: 0 },
      { band: '>20%', orders: 0, value: 0, percentage: 0 }
    ],
    monthlyTrend: months.map(month => ({
      month,
      sales: 0,
      gp: 0,
      totalOrders: 0,
      salespeople: {
        'John Smith': { sales: 0, gp: 0, orders: 0 },
        'Sarah Johnson': { sales: 0, gp: 0, orders: 0 },
        'Mike Chen': { sales: 0, gp: 0, orders: 0 }
      },
      customers: {
        'Toyota Motor Thailand': { sales: 0, gp: 0, orders: 0 },
        'Honda Automobile Thailand': { sales: 0, gp: 0, orders: 0 },
        'Isuzu Motors': { sales: 0, gp: 0, orders: 0 }
      }
    }))
  };
};
