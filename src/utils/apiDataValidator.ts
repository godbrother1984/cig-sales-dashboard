
import { DynamicsApiResponse } from '../services/dynamicsApiService';
import { getEmptyDataStructure } from './emptyDataStructure';

export const validateApiData = (apiData: DynamicsApiResponse) => {
  console.log('=== API Data Validation ===');
  
  // Add null/undefined checks for API data
  if (!apiData || typeof apiData !== 'object') {
    console.warn('Invalid API data received, using empty structure');
    return { isValid: false, emptyData: getEmptyDataStructure() };
  }
  
  // Handle the nested structure - get invoice and sales order data with fallbacks
  const invoiceData = Array.isArray(apiData.datas?.invoice) ? apiData.datas.invoice : [];
  const salesOrderData = Array.isArray(apiData.datas?.sales_order) ? apiData.datas.sales_order : [];
  
  console.log('Original invoice data count:', invoiceData.length);
  console.log('Original sales order data count:', salesOrderData.length);
  
  // If both arrays are empty, return empty structure
  if (invoiceData.length === 0 && salesOrderData.length === 0) {
    console.log('No data found in API response, using empty structure');
    return { isValid: false, emptyData: getEmptyDataStructure() };
  }
  
  return { 
    isValid: true, 
    invoiceData, 
    salesOrderData 
  };
};
