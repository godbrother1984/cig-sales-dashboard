
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
    grossProfit: number;
  };
}

export const transformApiDataToExpectedFormat = (apiData: DynamicsApiResponse, businessUnitFilter?: string) => {
  console.log('=== API Data Transformation Debug ===');
  console.log('Business unit filter:', businessUnitFilter);
  
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
  
  // If both arrays are empty, return empty structure
  if (invoiceData.length === 0 && salesOrderData.length === 0) {
    console.log('No data found in API response, using empty structure');
    return getEmptyDataStructure();
  }
  
  // Log all unique business units in the API data BEFORE mapping
  const originalBusinessUnits = new Set();
  invoiceData.forEach(item => {
    if (item?.bu) {
      originalBusinessUnits.add(item.bu);
    }
  });
  salesOrderData.forEach(item => {
    if (item?.bu) {
      originalBusinessUnits.add(item.bu);
    }
  });
  console.log('Original business units from API:', Array.from(originalBusinessUnits));
  
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
      // Ensure numeric fields are numbers - Use gross_profit for GP calculations
      total_inv: Number(item.total_inv) || 0,
      total_inv_amount: Number(item.total_inv_amount) || 0,
      gross_profit: Number(item.gross_profit) || 0,
      margin: Number(item.margin) || 0, // Keep margin for margin bands
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
      // Ensure numeric fields are numbers - Use gross_profit for GP calculations
      total_so: Number(item.total_so) || 0,
      total_so_amount: Number(item.total_so_amount) || 0,
      gross_profit: Number(item.gross_profit) || 0,
      margin: Number(item.margin) || 0 // Keep margin for margin bands
    };
  }).filter(item => item !== null);
  
  // Log business units after mapping
  const mappedBusinessUnits = new Set();
  processedInvoiceData.forEach(item => mappedBusinessUnits.add(item.businessUnit));
  processedSalesOrderData.forEach(item => mappedBusinessUnits.add(item.businessUnit));
  console.log('Business units after mapping:', Array.from(mappedBusinessUnits));
  
  // Apply business unit filter if specified
  let filteredInvoiceData, filteredSalesOrderData;
  
  if (businessUnitFilter && businessUnitFilter !== 'all') {
    console.log('=== APPLYING BUSINESS UNIT FILTER ===');
    console.log('Filter:', businessUnitFilter);
    
    filteredInvoiceData = processedInvoiceData.filter(item => {
      const matches = item && item.businessUnit === businessUnitFilter;
      if (matches) {
        console.log(`Invoice item matches filter: BU=${item.businessUnit}, Month=${item.month}, Amount=${item.total_inv_amount}, Orders=${item.total_inv}, GP=${item.gross_profit}`);
      }
      return matches;
    });
    
    filteredSalesOrderData = processedSalesOrderData.filter(item => {
      const matches = item && item.businessUnit === businessUnitFilter;
      if (matches) {
        console.log(`Sales Order item matches filter: BU=${item.businessUnit}, Month=${item.month}, Amount=${item.total_so_amount}, Orders=${item.total_so}, GP=${item.gross_profit}`);
      }
      return matches;
    });
    
    console.log(`Filtered results for ${businessUnitFilter}:`, {
      invoiceCount: filteredInvoiceData.length,
      salesOrderCount: filteredSalesOrderData.length
    });
  } else {
    console.log('Using ALL business units (no filter applied)');
    filteredInvoiceData = processedInvoiceData;
    filteredSalesOrderData = processedSalesOrderData;
  }
  
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
  
  // Aggregate data for the latest month from filtered data with detailed logging
  console.log(`=== AGGREGATING DATA FOR ${latestMonth.toUpperCase()} ===`);
  
  const latestInvoiceData = filteredInvoiceData
    .filter(item => {
      const matches = item && item.month && item.month.toLowerCase() === latestMonth;
      if (matches) {
        console.log(`Including invoice item for ${latestMonth}: BU=${item.businessUnit}, Amount=${item.total_inv_amount}, Orders=${item.total_inv}, GP=${item.gross_profit}`);
      }
      return matches;
    })
    .reduce((acc, item) => {
      if (!item) return acc;
      console.log(`Adding invoice values: Amount +${item.total_inv_amount}, Orders +${item.total_inv}, GP +${item.gross_profit}`);
      return {
        month: latestMonth,
        total_inv: acc.total_inv + (Number(item.total_inv) || 0),
        total_inv_amount: acc.total_inv_amount + (Number(item.total_inv_amount) || 0),
        gross_profit: acc.gross_profit + (Number(item.gross_profit) || 0),
        inv_margin_below_10: acc.inv_margin_below_10 + (Number(item.inv_margin_below_10) || 0),
        inv_margin_10_to_20: acc.inv_margin_10_to_20 + (Number(item.inv_margin_10_to_20) || 0),
        inv_margin_above_20: acc.inv_margin_above_20 + (Number(item.inv_margin_above_20) || 0)
      };
    }, {
      month: latestMonth,
      total_inv: 0,
      total_inv_amount: 0,
      gross_profit: 0,
      inv_margin_below_10: 0,
      inv_margin_10_to_20: 0,
      inv_margin_above_20: 0
    });

  const latestSalesOrderData = filteredSalesOrderData
    .filter(item => {
      const matches = item && item.month && item.month.toLowerCase() === latestMonth;
      if (matches) {
        console.log(`Including sales order item for ${latestMonth}: BU=${item.businessUnit}, Amount=${item.total_so_amount}, Orders=${item.total_so}, GP=${item.gross_profit}`);
      }
      return matches;
    })
    .reduce((acc, item) => {
      if (!item) return acc;
      console.log(`Adding sales order values: Amount +${item.total_so_amount}, Orders +${item.total_so}, GP +${item.gross_profit}`);
      return {
        month: latestMonth,
        total_so: acc.total_so + (Number(item.total_so) || 0),
        total_so_amount: acc.total_so_amount + (Number(item.total_so_amount) || 0),
        gross_profit: acc.gross_profit + (Number(item.gross_profit) || 0)
      };
    }, {
      month: latestMonth,
      total_so: 0,
      total_so_amount: 0,
      gross_profit: 0
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
    const invoiceGP = Number(latestInvoiceData?.gross_profit) || 0;
    const salesOrderGP = Number(latestSalesOrderData?.gross_profit) || 0;
    const invoiceOrders = Number(latestInvoiceData?.total_inv) || 0;
    const salesOrderOrders = Number(latestSalesOrderData?.total_so) || 0;
    
    currentMonthTotals.totalSales = invoiceAmount + salesOrderAmount;
    currentMonthTotals.totalGP = invoiceGP + salesOrderGP;
    currentMonthTotals.totalOrders = invoiceOrders + salesOrderOrders; // Confirmed: total_inv + total_so
    currentMonthTotals.averageMargin = currentMonthTotals.totalSales > 0 ? 
      (currentMonthTotals.totalGP / currentMonthTotals.totalSales) * 100 : 0;
    
    console.log('=== FINAL CURRENT MONTH TOTALS ===');
    console.log(`Business Unit Filter: ${businessUnitFilter}`);
    console.log(`Latest Month: ${latestMonth}`);
    console.log(`Invoice Amount: ${invoiceAmount}`);
    console.log(`Sales Order Amount: ${salesOrderAmount}`);
    console.log(`Total Sales: ${currentMonthTotals.totalSales}`);
    console.log(`Invoice GP: ${invoiceGP}`);
    console.log(`Sales Order GP: ${salesOrderGP}`);
    console.log(`Total GP: ${currentMonthTotals.totalGP}`);
    console.log(`Total Orders: ${currentMonthTotals.totalOrders}`);
    console.log(`Average Margin: ${currentMonthTotals.averageMargin}`);
  }
  
  // Transform monthly data from API response - aggregate by month across filtered business units
  const monthlyTrend: MonthlyData[] = [];
  
  // Sort available months chronologically
  const sortedAvailableMonths = availableMonthsArray.sort((a, b) => {
    const orderA = monthOrder[a as keyof typeof monthOrder] || 0;
    const orderB = monthOrder[b as keyof typeof monthOrder] || 0;
    return orderA - orderB;
  });
  
  console.log('=== GENERATING MONTHLY TREND ===');
  console.log('Sorted available months:', sortedAvailableMonths);
  
  // Generate monthly trend for all months that have data in the filtered API response
  sortedAvailableMonths.forEach(monthKey => {
    console.log(`Processing monthly trend for ${monthKey}:`);
    
    // Aggregate data for this month from filtered data
    const invoiceMonthData = filteredInvoiceData
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

    const salesOrderMonthData = filteredSalesOrderData
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
    
    // Combine invoice and sales order data
    const totalSales = (Number(invoiceMonthData.total_inv_amount) || 0) + (Number(salesOrderMonthData.total_so_amount) || 0);
    const totalGP = (Number(invoiceMonthData.gross_profit) || 0) + (Number(salesOrderMonthData.gross_profit) || 0);
    const totalOrders = (Number(invoiceMonthData.total_inv) || 0) + (Number(salesOrderMonthData.total_so) || 0);
    
    console.log(`  ${monthKey} totals: Sales=${totalSales}, GP=${totalGP}, Orders=${totalOrders}`);
    
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

  // Transform margin bands from the latest month aggregated data - use margin field for margin bands
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
