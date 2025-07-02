import { SalesData, MarginBand, MonthlyData } from '../types';
import { DynamicsApiResponse } from '../services/dynamicsApiService';
import { logBusinessUnits } from './businessUnitMapper';
import { 
  processInvoiceData, 
  processSalesOrderData, 
  filterDataByBusinessUnit,
  ProcessedInvoiceItem,
  ProcessedSalesOrderItem
} from './apiDataProcessor';
import { 
  getAvailableMonths, 
  findLatestMonth, 
  generateMonthlyTrend 
} from './monthlyTrendGenerator';
import { generateMarginBands } from './marginBandsGenerator';

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
  logBusinessUnits(invoiceData, 'Original invoice');
  logBusinessUnits(salesOrderData, 'Original sales order');
  
  // Process and map business units
  const processedInvoiceData = processInvoiceData(invoiceData);
  const processedSalesOrderData = processSalesOrderData(salesOrderData);
  
  // Log business units after mapping
  const mappedBusinessUnits = new Set();
  processedInvoiceData.forEach(item => mappedBusinessUnits.add(item.businessUnit));
  processedSalesOrderData.forEach(item => mappedBusinessUnits.add(item.businessUnit));
  console.log('Business units after mapping:', Array.from(mappedBusinessUnits));
  
  // Apply business unit filter if specified
  const filteredInvoiceData = filterDataByBusinessUnit(processedInvoiceData, businessUnitFilter);
  const filteredSalesOrderData = filterDataByBusinessUnit(processedSalesOrderData, businessUnitFilter);
  
  // Get available months and find latest
  const availableMonths = getAvailableMonths(filteredInvoiceData, filteredSalesOrderData);
  
  if (availableMonths.length === 0) {
    console.log('No valid months found in filtered data, using empty structure');
    return getEmptyDataStructure();
  }
  
  const latestMonth = findLatestMonth(availableMonths);
  
  // Aggregate data for the latest month
  const { latestInvoiceData, latestSalesOrderData } = aggregateLatestMonthData(
    filteredInvoiceData, 
    filteredSalesOrderData, 
    latestMonth
  );
  
  // Calculate current month totals
  const currentMonthTotals = calculateCurrentMonthTotals(latestInvoiceData, latestSalesOrderData, latestMonth, businessUnitFilter);
  
  // Generate monthly trend
  const monthlyTrend = generateMonthlyTrend(filteredInvoiceData, filteredSalesOrderData, availableMonths);
  
  // Generate margin bands
  const marginBands = generateMarginBands(latestInvoiceData);

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

const aggregateLatestMonthData = (
  filteredInvoiceData: ProcessedInvoiceItem[],
  filteredSalesOrderData: ProcessedSalesOrderItem[],
  latestMonth: string
) => {
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
  
  return { latestInvoiceData, latestSalesOrderData };
};

const calculateCurrentMonthTotals = (
  latestInvoiceData: any,
  latestSalesOrderData: any,
  latestMonth: string,
  businessUnitFilter?: string
) => {
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
    currentMonthTotals.totalOrders = invoiceOrders + salesOrderOrders;
    currentMonthTotals.averageMargin = currentMonthTotals.totalSales > 0 ? 
      (currentMonthTotals.totalGP / currentMonthTotals.totalSales) * 100 : 0;
    
    console.log('=== FINAL CURRENT MONTH TOTALS ===');
    console.log(`Business Unit Filter: ${businessUnitFilter}`);
    console.log(`Latest Month: ${latestMonth}`);
    console.log(`Total Sales: ${currentMonthTotals.totalSales}`);
    console.log(`Total GP: ${currentMonthTotals.totalGP}`);
    console.log(`Total Orders: ${currentMonthTotals.totalOrders}`);
    console.log(`Average Margin: ${currentMonthTotals.averageMargin}`);
  }
  
  return currentMonthTotals;
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
      salespeople: {},
      customers: {}
    }))
  };
};
