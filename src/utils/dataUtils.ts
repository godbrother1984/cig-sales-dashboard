
// Re-export all functions for backward compatibility
export { getQuarterBounds, getQuarterMonths } from './quarterUtils';
export { getSampleDynamicsData } from './sampleDataGenerator';
export { filterManualOrders } from './dataFiltering';
export { combineDataWithManualOrders } from './dataCombination';
export { transformApiDataToExpectedFormat, getEmptyDataStructure } from './apiDataTransformer';
export { mapBusinessUnit, normalizeBusinessUnit } from './businessUnitMapper';

// New utility functions for extracting filter options from data
export const extractAvailableCustomers = (salesData: any): string[] => {
  if (!salesData?.monthlyTrend) return [];
  
  const customers = new Set<string>();
  salesData.monthlyTrend.forEach((month: any) => {
    if (month.customers) {
      Object.keys(month.customers).forEach(customer => {
        // Only add customers that have actual data (non-zero values)
        const customerData = month.customers[customer];
        if (customerData.sales > 0 || customerData.gp > 0 || customerData.orders > 0) {
          customers.add(customer);
        }
      });
    }
  });
  
  return Array.from(customers).sort();
};

export const extractAvailableSalespeople = (salesData: any): string[] => {
  if (!salesData?.monthlyTrend) return [];
  
  const salespeople = new Set<string>();
  salesData.monthlyTrend.forEach((month: any) => {
    if (month.salespeople) {
      Object.keys(month.salespeople).forEach(person => {
        // Only add salespeople that have actual data (non-zero values)
        const personData = month.salespeople[person];
        if (personData.sales > 0 || personData.gp > 0 || personData.orders > 0) {
          salespeople.add(person);
        }
      });
    }
  });
  
  return Array.from(salespeople).sort();
};

export const extractManualOrderCustomers = (manualOrders: any[]): string[] => {
  if (!Array.isArray(manualOrders)) return [];
  
  const customers = new Set<string>();
  manualOrders.forEach(order => {
    if (order?.customerName) {
      customers.add(order.customerName);
    }
  });
  
  return Array.from(customers).sort();
};

export const extractManualOrderSalespeople = (manualOrders: any[]): string[] => {
  if (!Array.isArray(manualOrders)) return [];
  
  const salespeople = new Set<string>();
  manualOrders.forEach(order => {
    if (order?.salesperson) {
      salespeople.add(order.salesperson);
    }
  });
  
  return Array.from(salespeople).sort();
};
