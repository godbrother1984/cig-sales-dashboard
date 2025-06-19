
import { ManualOrder, DashboardFilters } from '../types';
import { getQuarterMonths } from './quarterUtils';

export const filterManualOrders = (
  orders: ManualOrder[], 
  filters: DashboardFilters, 
  currentMonth: number, 
  viewMode: string
): ManualOrder[] => {
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
    
    const productGroupMatch = filters.productGroup === 'all' || 
      order.productGroup === filters.productGroup;
    const customerMatch = filters.customerName === 'all' || 
      order.customerName === filters.customerName;
    const salespersonMatch = filters.salesperson === 'all' || 
      order.salesperson === filters.salesperson;
    
    return dateMatch && productGroupMatch && customerMatch && salespersonMatch;
  });
};
