
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

  // Sample data structure - replace with actual MS Dynamics 365 API call
  const sampleDynamicsData = {
    currentMonth: {
      totalSales: 2850000,
      totalGP: 627000,
      totalOrders: 156,
      averageMargin: 22.0
    },
    marginBands: [
      { band: '<10%', orders: 23, value: 456000, percentage: 16.0 },
      { band: '10-20%', orders: 67, value: 1824000, percentage: 64.0 },
      { band: '>20%', orders: 66, value: 570000, percentage: 20.0 }
    ],
    monthlyTrend: [
      { month: 'Jan', sales: 2900000, gp: 725000 },
      { month: 'Feb', sales: 3100000, gp: 806000 },
      { month: 'Mar', sales: 2750000, gp: 577500 },
      { month: 'Apr', sales: 3350000, gp: 871000 },
      { month: 'May', sales: 2850000, gp: 627000 }
    ]
  };

  const loadManualOrders = (): ManualOrder[] => {
    const savedOrders = localStorage.getItem('manualOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  };

  const filterManualOrders = (orders: ManualOrder[], currentFilters: typeof filters) => {
    return orders.filter(order => {
      const productGroupMatch = currentFilters.productGroup === 'all' || 
        order.productGroup === currentFilters.productGroup;
      const customerMatch = currentFilters.customerName === 'all' || 
        order.customerName === currentFilters.customerName;
      const salespersonMatch = currentFilters.salesperson === 'all' || 
        order.salesperson === currentFilters.salesperson;
      
      return productGroupMatch && customerMatch && salespersonMatch;
    });
  };

  const combineDataWithManualOrders = (dynamicsData: any, manualOrders: ManualOrder[]) => {
    // Filter manual orders based on current filters
    const filteredManualOrders = filterManualOrders(manualOrders, filters);
    
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
      monthlyTrend: dynamicsData.monthlyTrend // Keep original trend for now
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
    // Simulate API call to MS Dynamics 365 and combine with manual orders
    const fetchSalesData = async () => {
      try {
        // Replace with actual API endpoint
        // const response = await fetch('/api/dynamics365/sales-data');
        // const dynamicsData = await response.json();
        
        // Load manual orders
        const manualOrders = loadManualOrders();
        
        // Combine dynamics data with manual orders
        const combinedData = combineDataWithManualOrders(sampleDynamicsData, manualOrders);
        
        setSalesData(combinedData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        // Fallback: still combine with manual orders
        const manualOrders = loadManualOrders();
        const combinedData = combineDataWithManualOrders(sampleDynamicsData, manualOrders);
        setSalesData(combinedData);
      }
    };

    fetchSalesData();
    
    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchSalesData, 300000);
    return () => clearInterval(interval);
  }, [filters, targets]);

  // Add event listener for storage changes (when manual orders are added/removed)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'manualOrders') {
        // Reload data when manual orders change
        const manualOrders = loadManualOrders();
        const combinedData = combineDataWithManualOrders(sampleDynamicsData, manualOrders);
        setSalesData(combinedData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [filters]);

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
                src="/lovable-uploads/0d7b586d-cda7-430d-a86d-3e56c1d9d1a2.png" 
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
