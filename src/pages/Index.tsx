
import React, { useState, useEffect } from 'react';
import { KPISummary } from '../components/KPISummary';
import { TargetActualChart } from '../components/TargetActualChart';
import { MarginBandChart } from '../components/MarginBandChart';
import { DashboardFilters } from '../components/DashboardFilters';
import { TrendChart } from '../components/TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Settings, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ManualOrder {
  id: string;
  orderDate: string;
  customerName: string;
  productGroup: 'HBPM' | 'M&E';
  orderValue: number;
  grossMargin: number;
  grossProfit: number;
  salesperson: string;
}

const Index = () => {
  const [salesData, setSalesData] = useState(null);
  const [targets, setTargets] = useState({
    monthlySales: 3200000,
    monthlyGP: 800000,
    ytdSales: 15000000,
    ytdGP: 3500000
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'ytd'
  const [filters, setFilters] = useState({
    productGroup: 'all',
    customerName: 'all',
    salesperson: 'all'
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Enhanced sample data structure with month-specific data and salesperson information
  const getSampleDynamicsData = () => {
    const monthlyData = [
      { 
        month: 0, // January
        name: 'Jan',
        totalSales: 2900000, 
        totalGP: 725000, 
        totalOrders: 145,
        salespeople: {
          'John Smith': { sales: 1200000, gp: 300000, orders: 58 },
          'Sarah Johnson': { sales: 980000, gp: 245000, orders: 47 },
          'Mike Chen': { sales: 720000, gp: 180000, orders: 40 }
        },
        customers: {
          'Toyota Motor Thailand': { sales: 1450000, gp: 362500, orders: 72 },
          'Honda Automobile Thailand': { sales: 870000, gp: 217500, orders: 43 },
          'Isuzu Motors': { sales: 580000, gp: 145000, orders: 30 }
        }
      },
      { 
        month: 1, // February
        name: 'Feb',
        totalSales: 3100000, 
        totalGP: 806000, 
        totalOrders: 156,
        salespeople: {
          'John Smith': { sales: 1300000, gp: 338000, orders: 62 },
          'Sarah Johnson': { sales: 1050000, gp: 273000, orders: 52 },
          'Mike Chen': { sales: 750000, gp: 195000, orders: 42 }
        },
        customers: {
          'Toyota Motor Thailand': { sales: 1550000, gp: 403000, orders: 78 },
          'Honda Automobile Thailand': { sales: 930000, gp: 242000, orders: 46 },
          'Isuzu Motors': { sales: 620000, gp: 161000, orders: 32 }
        }
      },
      { 
        month: 2, // March
        name: 'Mar',
        totalSales: 2750000, 
        totalGP: 577500, 
        totalOrders: 138,
        salespeople: {
          'John Smith': { sales: 1150000, gp: 241500, orders: 55 },
          'Sarah Johnson': { sales: 935000, gp: 196350, orders: 47 },
          'Mike Chen': { sales: 665000, gp: 139650, orders: 36 }
        },
        customers: {
          'Toyota Motor Thailand': { sales: 1375000, gp: 288750, orders: 69 },
          'Honda Automobile Thailand': { sales: 825000, gp: 173250, orders: 41 },
          'Isuzu Motors': { sales: 550000, gp: 115500, orders: 28 }
        }
      },
      { 
        month: 3, // April
        name: 'Apr',
        totalSales: 3350000, 
        totalGP: 871000, 
        totalOrders: 168,
        salespeople: {
          'John Smith': { sales: 1407500, gp: 365950, orders: 67 },
          'Sarah Johnson': { sales: 1140000, gp: 296400, orders: 57 },
          'Mike Chen': { sales: 802500, gp: 208650, orders: 44 }
        },
        customers: {
          'Toyota Motor Thailand': { sales: 1675000, gp: 435500, orders: 84 },
          'Honda Automobile Thailand': { sales: 1005000, gp: 261300, orders: 50 },
          'Isuzu Motors': { sales: 670000, gp: 174200, orders: 34 }
        }
      },
      { 
        month: 4, // May
        name: 'May',
        totalSales: 2850000, 
        totalGP: 627000, 
        totalOrders: 156,
        salespeople: {
          'John Smith': { sales: 1197000, gp: 263340, orders: 62 },
          'Sarah Johnson': { sales: 969000, gp: 213180, orders: 52 },
          'Mike Chen': { sales: 684000, gp: 150480, orders: 42 }
        },
        customers: {
          'Toyota Motor Thailand': { sales: 1425000, gp: 313500, orders: 78 },
          'Honda Automobile Thailand': { sales: 855000, gp: 188100, orders: 46 },
          'Isuzu Motors': { sales: 570000, gp: 125400, orders: 32 }
        }
      }
    ];

    const currentMonthIndex = viewMode === 'monthly' ? selectedMonth : 4; // May for current data
    const currentMonthData = monthlyData[Math.min(currentMonthIndex, monthlyData.length - 1)];

    // Calculate YTD data if in YTD mode
    let displayData;
    if (viewMode === 'ytd') {
      const ytdData = monthlyData.slice(0, selectedMonth + 1).reduce((acc, month) => {
        acc.totalSales += month.totalSales;
        acc.totalGP += month.totalGP;
        acc.totalOrders += month.totalOrders;
        return acc;
      }, { totalSales: 0, totalGP: 0, totalOrders: 0 });
      
      displayData = {
        ...ytdData,
        averageMargin: ytdData.totalSales > 0 ? (ytdData.totalGP / ytdData.totalSales) * 100 : 0
      };
    } else {
      displayData = {
        totalSales: currentMonthData.totalSales,
        totalGP: currentMonthData.totalGP,
        totalOrders: currentMonthData.totalOrders,
        averageMargin: currentMonthData.totalSales > 0 ? (currentMonthData.totalGP / currentMonthData.totalSales) * 100 : 0
      };
    }

    // Apply filters to the data
    if (filters.salesperson !== 'all' && currentMonthData.salespeople[filters.salesperson]) {
      const salespersonData = currentMonthData.salespeople[filters.salesperson];
      if (viewMode === 'monthly') {
        displayData = {
          totalSales: salespersonData.sales,
          totalGP: salespersonData.gp,
          totalOrders: salespersonData.orders,
          averageMargin: salespersonData.sales > 0 ? (salespersonData.gp / salespersonData.sales) * 100 : 0
        };
      }
    }

    if (filters.customerName !== 'all' && currentMonthData.customers[filters.customerName]) {
      const customerData = currentMonthData.customers[filters.customerName];
      if (viewMode === 'monthly') {
        displayData = {
          totalSales: customerData.sales,
          totalGP: customerData.gp,
          totalOrders: customerData.orders,
          averageMargin: customerData.sales > 0 ? (customerData.gp / customerData.sales) * 100 : 0
        };
      }
    }

    return {
      currentMonth: displayData,
      marginBands: [
        { band: '<10%', orders: 23, value: 456000, percentage: 16.0 },
        { band: '10-20%', orders: 67, value: 1824000, percentage: 64.0 },
        { band: '>20%', orders: 66, value: 570000, percentage: 20.0 }
      ],
      monthlyTrend: monthlyData.slice(0, 5) // Show Jan to May
    };
  };

  const loadManualOrders = (): ManualOrder[] => {
    const savedOrders = localStorage.getItem('manualOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  };

  const filterManualOrders = (orders: ManualOrder[], currentFilters: typeof filters, currentMonth: number, isYTD: boolean) => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const orderMonth = orderDate.getMonth();
      
      // Date filtering based on selected month and view mode
      let dateMatch = false;
      if (isYTD) {
        dateMatch = orderMonth <= currentMonth; // YTD: from January to selected month
      } else {
        dateMatch = orderMonth === currentMonth; // Monthly: exact month match
      }
      
      const productGroupMatch = currentFilters.productGroup === 'all' || 
        order.productGroup === currentFilters.productGroup;
      const customerMatch = currentFilters.customerName === 'all' || 
        order.customerName === currentFilters.customerName;
      const salespersonMatch = currentFilters.salesperson === 'all' || 
        order.salesperson === currentFilters.salesperson;
      
      return dateMatch && productGroupMatch && customerMatch && salespersonMatch;
    });
  };

  const combineDataWithManualOrders = (dynamicsData: any, manualOrders: ManualOrder[]) => {
    // Filter manual orders based on current filters and selected month/YTD
    const filteredManualOrders = filterManualOrders(manualOrders, filters, selectedMonth, viewMode === 'ytd');
    
    // Calculate totals from manual orders
    const manualTotalSales = filteredManualOrders.reduce((sum, order) => sum + order.orderValue, 0);
    const manualTotalGP = filteredManualOrders.reduce((sum, order) => sum + order.grossProfit, 0);
    const manualOrderCount = filteredManualOrders.length;

    // Combine with dynamics data
    const combinedTotalSales = dynamicsData.currentMonth.totalSales + manualTotalSales;
    const combinedTotalGP = dynamicsData.currentMonth.totalGP + manualTotalGP;
    const combinedTotalOrders = dynamicsData.currentMonth.totalOrders + manualOrderCount;
    const combinedAverageMargin = combinedTotalSales > 0 ? (combinedTotalGP / combinedTotalSales) * 100 : 0;

    // Update margin bands to include manual orders
    const updatedMarginBands = [...dynamicsData.marginBands];
    
    filteredManualOrders.forEach(order => {
      let bandIndex;
      if (order.grossMargin < 10) {
        bandIndex = 0; // '<10%'
      } else if (order.grossMargin <= 20) {
        bandIndex = 1; // '10-20%'
      } else {
        bandIndex = 2; // '>20%'
      }
      
      updatedMarginBands[bandIndex].orders += 1;
      updatedMarginBands[bandIndex].value += order.orderValue;
    });

    // Recalculate percentages for margin bands
    const totalMarginBandValue = updatedMarginBands.reduce((sum, band) => sum + band.value, 0);
    updatedMarginBands.forEach(band => {
      band.percentage = totalMarginBandValue > 0 ? (band.value / totalMarginBandValue) * 100 : 0;
    });

    return {
      currentMonth: {
        totalSales: combinedTotalSales,
        totalGP: combinedTotalGP,
        totalOrders: combinedTotalOrders,
        averageMargin: combinedAverageMargin
      },
      targets: targets,
      marginBands: updatedMarginBands,
      monthlyTrend: dynamicsData.monthlyTrend
    };
  };

  useEffect(() => {
    // Load targets from localStorage
    const savedTargets = localStorage.getItem('salesTargets');
    if (savedTargets) {
      const parsedTargets = JSON.parse(savedTargets);
      setTargets(parsedTargets);
    }
  }, []);

  useEffect(() => {
    // Fetch sales data and combine with manual orders - now responds to month/YTD changes
    const fetchSalesData = async () => {
      try {
        // Get sample dynamics data based on current month and view mode
        const dynamicsData = getSampleDynamicsData();
        
        // Load manual orders
        const manualOrders = loadManualOrders();
        
        // Combine dynamics data with manual orders
        const combinedData = combineDataWithManualOrders(dynamicsData, manualOrders);
        
        setSalesData(combinedData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        // Fallback: still combine with manual orders
        const dynamicsData = getSampleDynamicsData();
        const manualOrders = loadManualOrders();
        const combinedData = combineDataWithManualOrders(dynamicsData, manualOrders);
        setSalesData(combinedData);
      }
    };

    fetchSalesData();
    
    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchSalesData, 300000);
    return () => clearInterval(interval);
  }, [filters, targets, selectedMonth, viewMode]); // Added selectedMonth and viewMode as dependencies

  // Add event listener for storage changes (when manual orders are added/removed)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'manualOrders') {
        // Reload data when manual orders change
        const manualOrders = loadManualOrders();
        const dynamicsData = getSampleDynamicsData();
        const combinedData = combineDataWithManualOrders(dynamicsData, manualOrders);
        setSalesData(combinedData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [filters, selectedMonth, viewMode]);

  if (!salesData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const currentTargets = viewMode === 'monthly' ? 
    { sales: targets.monthlySales, gp: targets.monthlyGP } :
    { sales: targets.ytdSales, gp: targets.ytdGP };

  const gapToSalesTarget = currentTargets.sales - salesData.currentMonth.totalSales;
  const gapToGPTarget = currentTargets.gp - salesData.currentMonth.totalGP;
  const requiredAverageMargin = gapToSalesTarget > 0 ? (gapToGPTarget / gapToSalesTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/f824e8a0-0b62-4bb3-9b89-50c3abc047a8.png" 
                alt="CiG BluSolutions Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Sales Performance Dashboard</h1>
                <p className="text-foreground/70">Real-time tracking from MS Dynamics 365</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-foreground/70">Last updated</p>
                <p className="text-sm font-medium text-foreground">{new Date().toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Link to="/targets">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Targets
                  </Button>
                </Link>
                <Link to="/manual-entry">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Manual Entry
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Month/YTD Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {viewMode === 'monthly' ? `${months[selectedMonth]} 2025` : 'Year-to-Date 2025'}
                </h2>
                <div className="flex items-center gap-2">
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="ytd">YTD</SelectItem>
                    </SelectContent>
                  </Select>
                  {viewMode === 'monthly' && (
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <DashboardFilters filters={filters} onFilterChange={setFilters} />

        {/* KPI Summary */}
        <KPISummary 
          data={salesData.currentMonth}
          targets={currentTargets}
          gapToSalesTarget={gapToSalesTarget}
          gapToGPTarget={gapToGPTarget}
          requiredAverageMargin={requiredAverageMargin}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target vs Actual */}
          <TargetActualChart 
            salesActual={salesData.currentMonth.totalSales}
            salesTarget={currentTargets.sales}
            gpActual={salesData.currentMonth.totalGP}
            gpTarget={currentTargets.gp}
          />

          {/* Margin Band Analysis */}
          <MarginBandChart data={salesData.marginBands} />
        </div>

        {/* Monthly Trend */}
        <TrendChart data={salesData.monthlyTrend} />

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              Action Items & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-foreground">Sales Gap</h4>
                <p className="text-lg font-bold text-primary">฿{Math.max(gapToSalesTarget, 0).toLocaleString()}</p>
                <p className="text-xs text-foreground/70">Remaining to reach {viewMode} target</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-foreground">GP Gap</h4>
                <p className="text-lg font-bold text-destructive">฿{Math.max(gapToGPTarget, 0).toLocaleString()}</p>
                <p className="text-xs text-foreground/70">Remaining to reach GP target</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-foreground">Required Avg Margin</h4>
                <p className="text-lg font-bold text-orange-600">{requiredAverageMargin.toFixed(1)}%</p>
                <p className="text-xs text-foreground/70">For remaining orders to hit target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
