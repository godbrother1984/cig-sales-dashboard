
import { DynamicsApiResponse } from '../services/dynamicsApiService';
import { logBusinessUnits } from './businessUnitMapper';
import { 
  processInvoiceData, 
  processSalesOrderData, 
  filterDataByBusinessUnit
} from './apiDataProcessor';
import { 
  getAvailableMonths, 
  findLatestMonth, 
  generateMonthlyTrend 
} from './monthlyTrendGenerator';
import { generateMarginBands } from './marginBandsGenerator';
import { aggregateLatestMonthData } from './dataAggregation';
import { calculateCurrentMonthTotals } from './monthTotalsCalculator';
import { getEmptyDataStructure } from './emptyDataStructure';
import { validateApiData } from './apiDataValidator';

export const transformApiDataToExpectedFormat = (apiData: DynamicsApiResponse, businessUnitFilter?: string) => {
  console.log('=== API Data Transformation Debug ===');
  console.log('Business unit filter:', businessUnitFilter);
  
  // Validate API data
  const validation = validateApiData(apiData);
  if (!validation.isValid) {
    return validation.emptyData;
  }
  
  const { invoiceData, salesOrderData } = validation;
  
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

// Re-export for backward compatibility
export { getEmptyDataStructure };
