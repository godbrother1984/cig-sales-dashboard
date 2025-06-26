
import { SalesData, MarginBand, MonthlyData } from '../types';
import { DynamicsApiResponse } from '../services/dynamicsApiService';

// Business unit mapping from API to application format
const mapBusinessUnit = (apiBusinessUnit: string): string => {
  const businessUnitMapping: { [key: string]: string } = {
    'Coil': 'Coil',
    'Coil(Unit)': 'Unit',
    'M&E': 'M&E',
    'HBPM': 'HBPM',
    'MKT': 'MKT'
  };
  
  return businessUnitMapping[apiBusinessUnit] || apiBusinessUnit;
};

// Type definition for business unit totals
interface BusinessUnitTotals {
  [businessUnit: string]: {
    amount: number;
    orders: number;
    margin: number;
  };
}

export const transformApiDataToExpectedFormat = (apiData: DynamicsApiResponse, businessUnitFilter?: string) => {
  console.log('=== API Data Transformation Debug ===');
  console.log('Business unit filter:', businessUnitFilter);
  console.log('Raw API data:', apiData);
  
  // Add null/undefined checks for API data
  if (!apiData || typeof apiData !== 'object') {
    console.warn('Invalid API data received, using empty structure');
    return getEmptyDataStructure();
  }
  
  // Handle the nested structure - get invoice and sales order data with fallbacks
  const invoiceData = Array.isArray(apiData.datas?.invoice) ? apiData.datas.invoice : [];
  const salesOrderData = Array.isArray(apiData.datas?.sales_order) ? apiData.datas.sales_order : [];
  
  console.log('Original invoice data count:', invoiceData.length);
  console.log('Original sales order data count:', salesOrderData.length);
  
  // Log all unique business units in the API data
  const allBusinessUnits = new Set();
  invoiceData.forEach(item => {
    if (item?.bu) {
      allBusinessUnits.add(item.bu);
    }
  });
  salesOrderData.forEach(item => {
    if (item?.bu) {
      allBusinessUnits.add(item.bu);
    }
  });
  console.log('All business units found in API data:', Array.from(allBusinessUnits));
  
  // If both arrays are empty, return empty structure
  if (invoiceData.length === 0 && salesOrderData.length === 0) {
    console.log('No data found in API response, using empty structure');
    return getEmptyDataStructure();
  }
  
  // Apply business unit mapping to data with null checks
  const processedInvoiceData = invoiceData.map(item => {
    if (!item || typeof item !== 'object') {
      console.warn('Invalid invoice item:', item);
      return null;
    }
    const mappedBU = mapBusinessUnit(item.bu || 'Coil');
    return {
      ...item,
      businessUnit: mappedBU,
      originalBU: item.bu, // Keep original for debugging
      // Ensure numeric fields are numbers
      total_inv: Number(item.total_inv) || 0,
      total_inv_amount: Number(item.total_inv_amount) || 0,
      margin: Number(item.margin) || 0,
      inv_margin_below_10: Number(item.inv_margin_below_10) || 0,
      inv_margin_10_to_20: Number(item.inv_margin_10_to_20) || 0,
      inv_margin_above_20: Number(item.inv_margin_above_20) || 0
    };
  }).filter(item => item !== null);
  
  const processedSalesOrderData = salesOrderData.map(item => {
    if (!item || typeof item !== 'object') {
      console.warn('Invalid sales order item:', item);
      return null;
    }
    const mappedBU = mapBusinessUnit(item.bu || 'Coil');
    return {
      ...item,
      businessUnit: mappedBU,
      originalBU: item.bu, // Keep original for debugging
      // Ensure numeric fields are numbers
      total_so: Number(item.total_so) || 0,
      total_so_amount: Number(item.total_so_amount) || 0,
      margin: Number(item.margin) || 0
    };
  }).filter(item => item !== null);
  
  console.log('Processed invoice data (with BU mapping):', processedInvoiceData);
  console.log('Processed sales order data (with BU mapping):', processedSalesOrderData);
  
  // Log business unit distribution after mapping
  const mappedBusinessUnits = new Set();
  processedInvoiceData.forEach(item => mappedBusinessUnits.add(item.businessUnit));
  processedSalesOrderData.forEach(item => mappedBusinessUnits.add(item.businessUnit));
  console.log('Business units after mapping:', Array.from(mappedBusinessUnits));
  
  // Apply business unit filter if specified
  let filteredInvoiceData, filteredSalesOrderData;
  
  if (businessUnitFilter && businessUnitFilter !== 'all') {
    console.log('Applying specific business unit filter:', businessUnitFilter);
    filteredInvoiceData = processedInvoiceData.filter(item => item && item.businessUnit === businessUnitFilter);
    filteredSalesOrderData = processedSalesOrderData.filter(item => item && item.businessUnit === businessUnitFilter);
  } else {
    console.log('Using ALL business units (no filter applied)');
    filteredInvoiceData = processedInvoiceData;
    filteredSalesOrderData = processedSalesOrderData;
  }
  
  console.log('Filtered data counts:', {
    businessUnitFilter,
    originalInvoiceCount: processedInvoiceData.length,
    filteredInvoiceCount: filteredInvoiceData.length,
    originalSalesOrderCount: processedSalesOrderData.length,
    filteredSalesOrderCount: filteredSalesOrderData.length
  });
  
  // Log aggregated totals by business unit for debugging
  const invoiceTotalsByBU: BusinessUnitTotals = {};
  const salesOrderTotalsByBU: BusinessUnitTotals = {};
  
  filteredInvoiceData.forEach(item => {
    const bu = item.businessUnit;
    if (!invoiceTotalsByBU[bu]) {
      invoiceTotalsByBU[bu] = { amount: 0, orders: 0, margin: 0 };
    }
    invoiceTotalsByBU[bu].amount += item.total_inv_amount;
    invoiceTotalsByBU[bu].orders += item.total_inv;
    invoiceTotalsByBU[bu].margin += item.margin;
  });
  
  filteredSalesOrderData.forEach(item => {
    const bu = item.businessUnit;
    if (!salesOrderTotalsByBU[bu]) {
      salesOrderTotalsByBU[bu] = { amount: 0, orders: 0, margin: 0 };
    }
    salesOrderTotalsByBU[bu].amount += item.total_so_amount;
    salesOrderTotalsByBU[bu].orders += item.total_so;
    salesOrderTotalsByBU[bu].margin += item.margin;
  });
  
  console.log('Invoice totals by business unit:', invoiceTotalsByBU);
  console.log('Sales order totals by business unit:', salesOrderTotalsByBU);
  
  // Calculate grand totals with proper typing
  const grandTotals = {
    invoiceAmount: Object.values(invoiceTotalsByBU).reduce((sum, bu) => sum + bu.amount, 0),
    invoiceOrders: Object.values(invoiceTotalsByBU).reduce((sum, bu) => sum + bu.orders, 0),
    invoiceMargin: Object.values(invoiceTotalsByBU).reduce((sum, bu) => sum + bu.margin, 0),
    salesOrderAmount: Object.values(salesOrderTotalsByBU).reduce((sum, bu) => sum + bu.amount, 0),
    salesOrderOrders: Object.values(salesOrderTotalsByBU).reduce((sum, bu) => sum + bu.orders, 0),
    salesOrderMargin: Object.values(salesOrderTotalsByBU).reduce((sum, bu) => sum + bu.margin, 0)
  };
  
  console.log('GRAND TOTALS:', grandTotals);
  
  // Define month order for chronological comparison
  const monthOrder = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  
  // Extract all unique months that actually exist in the filtered API data
  const availableMonths = new Set<string>();
  filteredInvoiceData.forEach(item => {
    if (item && item.month && typeof item.month === 'string') {
      availableMonths.add(item.month.toLowerCase());
    }
  });
  filteredSalesOrderData.forEach(item => {
    if (item && item.month && typeof item.month === 'string') {
      availableMonths.add(item.month.toLowerCase());
    }
  });
  
  const availableMonthsArray = Array.from(availableMonths);
  console.log('Available months in filtered data:', availableMonthsArray);
  
  // If no valid months found, return empty structure
  if (availableMonthsArray.length === 0) {
    console.log('No valid months found in filtered data, using empty structure');
    return getEmptyDataStructure();
  }
  
  // Find the chronologically latest month from the available data
  let latestMonth = '';
  let latestMonthOrder = 0;
  
  availableMonthsArray.forEach(month => {
    const order = monthOrder[month as keyof typeof monthOrder];
    if (order && order > latestMonthOrder) {
      latestMonthOrder = order;
      latestMonth = month;
    }
  });
  
  console.log(`Latest month found: ${latestMonth} (order: ${latestMonthOrder})`);
  
  // If no valid latest month found, use the first available month
  if (!latestMonth && availableMonthsArray.length > 0) {
    latestMonth = availableMonthsArray[0];
    console.log(`Using first available month as fallback: ${latestMonth}`);
  }
  
  // Aggregate data for the latest month from filtered data
  const latestInvoiceData = filteredInvoiceData
    .filter(item => item && item.month && item.month.toLowerCase() === latestMonth)
    .reduce((acc, item) => {
      if (!item) return acc;
      return {
        month: latestMonth,
        total_inv: acc.total_inv + (Number(item.total_inv) || 0),
        total_inv_amount: acc.total_inv_amount + (Number(item.total_inv_amount) || 0),
        margin: acc.margin + (Number(item.margin) || 0),
        inv_margin_below_10: acc.inv_margin_below_10 + (Number(item.inv_margin_below_10) || 0),
        inv_margin_10_to_20: acc.inv_margin_10_to_20 + (Number(item.inv_margin_10_to_20) || 0),
        inv_margin_above_20: acc.inv_margin_above_20 + (Number(item.inv_margin_above_20) || 0)
      };
    }, {
      month: latestMonth,
      total_inv: 0,
      total_inv_amount: 0,
      margin: 0,
      inv_margin_below_10: 0,
      inv_margin_10_to_20: 0,
      inv_margin_above_20: 0
    });

  const latestSalesOrderData = filteredSalesOrderData
    .filter(item => item && item.month && item.month.toLowerCase() === latestMonth)
    .reduce((acc, item) => {
      if (!item) return acc;
      return {
        month: latestMonth,
        total_so: acc.total_so + (Number(item.total_so) || 0),
        total_so_amount: acc.total_so_amount + (Number(item.total_so_amount) || 0),
        margin: acc.margin + (Number(item.margin) || 0)
      };
    }, {
      month: latestMonth,
      total_so: 0,
      total_so_amount: 0,
      margin: 0
    });
  
  console.log('Latest month aggregated data:', {
    businessUnitFilter,
    latestInvoiceData,
    latestSalesOrderData
  });
  
  // Calculate current month totals from the latest available data
  let currentMonthTotals = {
    totalSales: 0,
    totalGP: 0,
    totalOrders: 0,
    averageMargin: 0
  };
  
  if (latestMonth) {
    const invoiceAmount = Number(latestInvoiceData?.total_inv_amount) || 0;
    const salesOrderAmount = Number(latestSalesOrderData?.total_so_amount) || 0;
    const invoiceGP = Number(latestInvoiceData?.margin) || 0;
    const salesOrderGP = Number(latestSalesOrderData?.margin) || 0;
    const invoiceOrders = Number(latestInvoiceData?.total_inv) || 0;
    const salesOrderOrders = Number(latestSalesOrderData?.total_so) || 0;
    
    currentMonthTotals.totalSales = invoiceAmount + salesOrderAmount;
    currentMonthTotals.totalGP = invoiceGP + salesOrderGP;
    currentMonthTotals.totalOrders = invoiceOrders + salesOrderOrders;
    currentMonthTotals.averageMargin = currentMonthTotals.totalSales > 0 ? 
      (currentMonthTotals.totalGP / currentMonthTotals.totalSales) * 100 : 0;
    
    console.log('FINAL CURRENT MONTH TOTALS:', {
      latestMonth: latestMonth,
      businessUnitFilter: businessUnitFilter,
      invoiceAmount,
      salesOrderAmount,
      totalSales: currentMonthTotals.totalSales,
      invoiceGP,
      salesOrderGP,
      totalGP: currentMonthTotals.totalGP,
      totalOrders: currentMonthTotals.totalOrders,
      averageMargin: currentMonthTotals.averageMargin
    });
  }
  
  // Transform monthly data from API response - aggregate by month across all business units
  const monthlyTrend: MonthlyData[] = [];
  
  // Sort available months chronologically
  const sortedAvailableMonths = availableMonthsArray.sort((a, b) => {
    const orderA = monthOrder[a as keyof typeof monthOrder] || 0;
    const orderB = monthOrder[b as keyof typeof monthOrder] || 0;
    return orderA - orderB;
  });
  
  console.log('Sorted available months:', sortedAvailableMonths);
  
  // Generate monthly trend for all months that have data in the filtered API response
  sortedAvailableMonths.forEach(monthKey => {
    // Aggregate data for this month from filtered data
    const invoiceMonthData = filteredInvoiceData
      .filter(item => item && item.month && item.month.toLowerCase() === monthKey)
      .reduce((acc, item) => {
        if (!item) return acc;
        return {
          total_inv_amount: acc.total_inv_amount + (Number(item.total_inv_amount) || 0),
          margin: acc.margin + (Number(item.margin) || 0),
          total_inv: acc.total_inv + (Number(item.total_inv) || 0)
        };
      }, { total_inv_amount: 0, margin: 0, total_inv: 0 });

    const salesOrderMonthData = filteredSalesOrderData
      .filter(item => item && item.month && item.month.toLowerCase() === monthKey)
      .reduce((acc, item) => {
        if (!item) return acc;
        return {
          total_so_amount: acc.total_so_amount + (Number(item.total_so_amount) || 0),
          margin: acc.margin + (Number(item.margin) || 0),
          total_so: acc.total_so + (Number(item.total_so) || 0)
        };
      }, { total_so_amount: 0, margin: 0, total_so: 0 });
    
    // Combine invoice and sales order data
    const totalSales = (Number(invoiceMonthData.total_inv_amount) || 0) + (Number(salesOrderMonthData.total_so_amount) || 0);
    const totalGP = (Number(invoiceMonthData.margin) || 0) + (Number(salesOrderMonthData.margin) || 0);
    const totalOrders = (Number(invoiceMonthData.total_inv) || 0) + (Number(salesOrderMonthData.total_so) || 0);
    
    console.log(`Month ${monthKey} totals:`, { totalSales, totalGP, totalOrders });
    
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
  });

  // Transform margin bands from the latest month aggregated data
  const marginBands: MarginBand[] = [];
  
  if (latestInvoiceData && Number(latestInvoiceData.total_inv_amount) > 0) {
    const totalValue = Number(latestInvoiceData.total_inv_amount) || 0;
    const totalOrders = Number(latestInvoiceData.total_inv) || 0;
    
    const below10Orders = Number(latestInvoiceData.inv_margin_below_10) || 0;
    const band10to20Orders = Number(latestInvoiceData.inv_margin_10_to_20) || 0;
    const above20Orders = Number(latestInvoiceData.inv_margin_above_20) || 0;
    
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

  const finalResult = {
    currentMonth: currentMonthTotals,
    marginBands,
    monthlyTrend
  };

  console.log('=== FINAL TRANSFORMED RESULT ===');
  console.log('Business unit filter applied:', businessUnitFilter);
  console.log('Final result:', finalResult);
  console.log('=== END DEBUG ===');

  return finalResult;
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
