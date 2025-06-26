
import { ManualOrder, DashboardFilters } from '../types';
import { getQuarterMonths } from './quarterUtils';

// Business unit mapping to ensure consistency between manual orders and API data
const normalizeBusinessUnit = (businessUnit: string): string => {
  // Ensure consistent business unit naming
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

export const filterManualOrders = (
  orders: ManualOrder[], 
  filters: DashboardFilters, 
  currentMonth: number, 
  viewMode: string
): ManualOrder[] => {
  console.log('=== FILTERING MANUAL ORDERS ===');
  console.log('Filter business unit:', filters.businessUnit);
  console.log('Total manual orders:', orders.length);
  console.log('Manual orders by business unit:', orders.reduce((acc, order) => {
    const bu = normalizeBusinessUnit(order.businessUnit);
    acc[bu] = (acc[bu] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number }));
  
  return orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    const orderMonth = orderDate.getMonth();
    
    let dateMatch = false;
    if (viewMode === 'ytd') {
      dateMatch = orderMonth <= currentMonth;
    } else if (viewMode === 'qtd') {
      const quarterBounds = getQuarterMonths(currentMonth);
      dateMatch = orderMonth >= quarterBounds.start && orderMonth <= quarterBounds.end;
    } else {
      dateMatch = orderMonth === currentMonth;
    }
    
    // Normalize business units for consistent comparison
    const normalizedOrderBU = normalizeBusinessUnit(order.businessUnit);
    const normalizedFilterBU = filters.businessUnit === 'all' ? 'all' : normalizeBusinessUnit(filters.businessUnit);
    
    const businessUnitMatch = normalizedFilterBU === 'all' || normalizedOrderBU === normalizedFilterBU;
    
    const customerMatch = filters.customerName === 'all' || 
      order.customerName === filters.customerName;
    const salespersonMatch = filters.salesperson === 'all' || 
      order.salesperson === filters.salesperson;
    
    const matches = dateMatch && businessUnitMatch && customerMatch && salespersonMatch;
    
    if (matches) {
      console.log(`Manual order matches filter: BU=${normalizedOrderBU}, Date=${order.orderDate}, Value=${order.orderValue}`);
    }
    
    return matches;
  });
};
