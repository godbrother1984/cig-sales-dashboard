
import { ProcessedInvoiceItem, ProcessedSalesOrderItem } from './apiDataProcessor';

export const aggregateLatestMonthData = (
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
