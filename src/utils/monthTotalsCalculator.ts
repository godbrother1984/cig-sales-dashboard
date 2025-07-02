
export const calculateCurrentMonthTotals = (
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
