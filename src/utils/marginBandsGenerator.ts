
import { MarginBand } from '../types';

export const generateMarginBands = (latestInvoiceData: any): MarginBand[] => {
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
    marginBands.push(
      { band: '<10%', orders: 0, value: 0, percentage: 0 },
      { band: '10-20%', orders: 0, value: 0, percentage: 0 },
      { band: '>20%', orders: 0, value: 0, percentage: 0 }
    );
  }

  return marginBands;
};
