
export const getCurrentMonthIndex = (): number => {
  return new Date().getMonth();
};

export const getAvailableMonths = (salesData: any, manualOrders: any[]): number[] => {
  const availableMonths: Set<number> = new Set();
  
  // Always include the current month
  const currentMonthIndex = getCurrentMonthIndex();
  availableMonths.add(currentMonthIndex);
  
  // Add months that have actual API data (non-zero sales or orders)
  if (salesData && salesData.monthlyTrend) {
    salesData.monthlyTrend.forEach((monthData: any) => {
      if (monthData.sales > 0 || monthData.gp > 0 || monthData.totalOrders > 0) {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = monthNames.indexOf(monthData.month.toLowerCase());
        if (monthIndex !== -1) {
          availableMonths.add(monthIndex);
        }
      }
    });
  }
  
  // Add months that have manual orders
  if (Array.isArray(manualOrders)) {
    manualOrders.forEach(order => {
      if (order?.orderDate) {
        const orderMonth = new Date(order.orderDate).getMonth();
        availableMonths.add(orderMonth);
      }
    });
  }
  
  return Array.from(availableMonths).sort((a, b) => a - b);
};

export const isMonthAvailable = (monthIndex: number, salesData: any, manualOrders: any[]): boolean => {
  const availableMonths = getAvailableMonths(salesData, manualOrders);
  return availableMonths.includes(monthIndex);
};
