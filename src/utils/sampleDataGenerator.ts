
import { MonthlyData, SalesData, MarginBand } from '../types';

const getCurrentMonth = () => new Date().getMonth();

const generateMonthData = (monthIndex: number): MonthlyData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Base values with some variation per month
  const baseValues = [
    { sales: 2900000, gp: 725000, orders: 145 },
    { sales: 3100000, gp: 806000, orders: 156 },
    { sales: 2750000, gp: 577500, orders: 138 },
    { sales: 3350000, gp: 871000, orders: 168 },
    { sales: 2850000, gp: 627000, orders: 156 },
    { sales: 3200000, gp: 800000, orders: 160 },
    { sales: 3100000, gp: 775000, orders: 155 },
    { sales: 2950000, gp: 737500, orders: 148 },
    { sales: 3400000, gp: 850000, orders: 170 },
    { sales: 3250000, gp: 812500, orders: 163 },
    { sales: 3150000, gp: 787500, orders: 158 },
    { sales: 3300000, gp: 825000, orders: 165 }
  ];

  const monthData = baseValues[monthIndex];
  
  return {
    month: months[monthIndex],
    sales: monthData.sales,
    gp: monthData.gp,
    totalOrders: monthData.orders,
    salespeople: {
      'John Smith': { 
        sales: Math.round(monthData.sales * 0.41), 
        gp: Math.round(monthData.gp * 0.41), 
        orders: Math.round(monthData.orders * 0.4) 
      },
      'Sarah Johnson': { 
        sales: Math.round(monthData.sales * 0.34), 
        gp: Math.round(monthData.gp * 0.34), 
        orders: Math.round(monthData.orders * 0.33) 
      },
      'Mike Chen': { 
        sales: Math.round(monthData.sales * 0.25), 
        gp: Math.round(monthData.gp * 0.25), 
        orders: Math.round(monthData.orders * 0.27) 
      }
    },
    customers: {
      'Toyota Motor Thailand': { 
        sales: Math.round(monthData.sales * 0.5), 
        gp: Math.round(monthData.gp * 0.5), 
        orders: Math.round(monthData.orders * 0.5) 
      },
      'Honda Automobile Thailand': { 
        sales: Math.round(monthData.sales * 0.3), 
        gp: Math.round(monthData.gp * 0.3), 
        orders: Math.round(monthData.orders * 0.29) 
      },
      'Isuzu Motors': { 
        sales: Math.round(monthData.sales * 0.2), 
        gp: Math.round(monthData.gp * 0.2), 
        orders: Math.round(monthData.orders * 0.21) 
      }
    }
  };
};

export const getSampleDynamicsData = (): { 
  currentMonth: SalesData; 
  marginBands: MarginBand[]; 
  monthlyTrend: MonthlyData[] 
} => {
  const currentMonth = getCurrentMonth();
  const monthlyData: MonthlyData[] = [];
  
  // Generate data for all months up to and including current month
  for (let i = 0; i <= currentMonth; i++) {
    monthlyData.push(generateMonthData(i));
  }

  return {
    currentMonth: {
      totalSales: 0,
      totalGP: 0,
      totalOrders: 0,
      averageMargin: 0
    },
    marginBands: [
      { band: '<10%', orders: 23, value: 456000, percentage: 16.0 },
      { band: '10-20%', orders: 67, value: 1824000, percentage: 64.0 },
      { band: '>20%', orders: 66, value: 570000, percentage: 20.0 }
    ],
    monthlyTrend: monthlyData
  };
};
