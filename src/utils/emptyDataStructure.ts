
export const getEmptyDataStructure = () => {
  const currentMonthIndex = new Date().getMonth();
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  // Create monthly trend that includes current month with zero data
  // This ensures the current month appears even when there's no API data
  const monthlyTrend = [];
  
  // Add the current month with zero values to ensure it's always available
  monthlyTrend.push({
    month: monthNames[currentMonthIndex],
    sales: 0,
    gp: 0,
    totalOrders: 0,
    salespeople: {},
    customers: {}
  });
  
  return {
    currentMonth: {
      totalSales: 0,
      totalGP: 0,
      totalOrders: 0,
      averageMargin: 0
    },
    marginBands: [
      { band: '<10%', orders: 0, value: 0, percentage: 0 },
      { band: '10-20%', orders: 0, value: 0, percentage: 0 },
      { band: '>20%', orders: 0, value: 0, percentage: 0 }
    ],
    monthlyTrend
  };
};
