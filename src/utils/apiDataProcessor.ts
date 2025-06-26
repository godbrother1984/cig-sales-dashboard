
import { mapBusinessUnit } from './businessUnitMapper';

export interface ProcessedInvoiceItem {
  businessUnit: string;
  originalBU: string;
  month: string;
  total_inv: number;
  total_inv_amount: number;
  gross_profit: number;
  margin: number;
  inv_margin_below_10: number;
  inv_margin_10_to_20: number;
  inv_margin_above_20: number;
}

export interface ProcessedSalesOrderItem {
  businessUnit: string;
  originalBU: string;
  month: string;
  total_so: number;
  total_so_amount: number;
  gross_profit: number;
  margin: number;
}

export const processInvoiceData = (invoiceData: any[]): ProcessedInvoiceItem[] => {
  return invoiceData.map(item => {
    if (!item || typeof item !== 'object') {
      console.warn('Invalid invoice item:', item);
      return null;
    }
    const mappedBU = mapBusinessUnit(item.bu || 'Coil');
    return {
      ...item,
      businessUnit: mappedBU,
      originalBU: item.bu,
      total_inv: Number(item.total_inv) || 0,
      total_inv_amount: Number(item.total_inv_amount) || 0,
      gross_profit: Number(item.gross_profit) || 0,
      margin: Number(item.margin) || 0,
      inv_margin_below_10: Number(item.inv_margin_below_10) || 0,
      inv_margin_10_to_20: Number(item.inv_margin_10_to_20) || 0,
      inv_margin_above_20: Number(item.inv_margin_above_20) || 0
    };
  }).filter(item => item !== null);
};

export const processSalesOrderData = (salesOrderData: any[]): ProcessedSalesOrderItem[] => {
  return salesOrderData.map(item => {
    if (!item || typeof item !== 'object') {
      console.warn('Invalid sales order item:', item);
      return null;
    }
    const mappedBU = mapBusinessUnit(item.bu || 'Coil');
    return {
      ...item,
      businessUnit: mappedBU,
      originalBU: item.bu,
      total_so: Number(item.total_so) || 0,
      total_so_amount: Number(item.total_so_amount) || 0,
      gross_profit: Number(item.gross_profit) || 0,
      margin: Number(item.margin) || 0
    };
  }).filter(item => item !== null);
};

export const filterDataByBusinessUnit = <T extends { businessUnit: string }>(
  data: T[], 
  businessUnitFilter: string
): T[] => {
  if (!businessUnitFilter || businessUnitFilter === 'all') {
    console.log('Using ALL business units (no filter applied)');
    return data;
  }

  console.log('=== APPLYING BUSINESS UNIT FILTER ===');
  console.log('Filter:', businessUnitFilter);
  
  const filtered = data.filter(item => {
    const matches = item && item.businessUnit === businessUnitFilter;
    if (matches) {
      console.log(`Item matches filter: BU=${item.businessUnit}`);
    }
    return matches;
  });
  
  console.log(`Filtered results for ${businessUnitFilter}:`, filtered.length);
  return filtered;
};
