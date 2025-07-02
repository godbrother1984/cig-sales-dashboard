
export const getCurrentMonthIndex = (): number => {
  return new Date().getMonth();
};

export const getAvailableMonths = (salesData: any, manualOrders: any[]): number[] => {
  const currentMonthIndex = getCurrentMonthIndex();
  const availableMonths: Set<number> = new Set();
  
  // Add months up to current month (from API data structure)
  for (let i = 0; i <= currentMonthIndex; i++) {
    availableMonths.add(i);
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
