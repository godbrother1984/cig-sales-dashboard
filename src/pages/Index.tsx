
import React, { useState, useEffect } from 'react';
import { KPISummary } from '../components/KPISummary';
import { TargetActualChart } from '../components/TargetActualChart';
import { MarginBandChart } from '../components/MarginBandChart';
import { DashboardFilters } from '../components/DashboardFilters';
import { TrendChart } from '../components/TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Settings, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [salesData, setSalesData] = useState(null);
  const [filters, setFilters] = useState({
    productGroup: 'all',
    customerName: 'all',
    salesperson: 'all'
  });

  // Sample data structure - replace with actual MS Dynamics 365 API call
  const sampleData = {
    currentMonth: {
      totalSales: 2850000,
      totalGP: 627000,
      totalOrders: 156,
      averageMargin: 22.0
    },
    targets: {
      monthlySales: 3200000,
      monthlyGP: 800000
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

  useEffect(() => {
    // Simulate API call to MS Dynamics 365
    const fetchSalesData = async () => {
      try {
        // Replace with actual API endpoint
        // const response = await fetch('/api/dynamics365/sales-data');
        // const data = await response.json();
        setSalesData(sampleData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData(sampleData); // Fallback to sample data
      }
    };

    fetchSalesData();
    
    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchSalesData, 300000);
    return () => clearInterval(interval);
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

  const gapToSalesTarget = salesData.targets.monthlySales - salesData.currentMonth.totalSales;
  const gapToGPTarget = salesData.targets.monthlyGP - salesData.currentMonth.totalGP;
  const requiredAverageMargin = gapToSalesTarget > 0 ? (gapToGPTarget / gapToSalesTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/placeholder.svg" 
                alt="CiG BluSolutions Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Sales Performance Dashboard</h1>
                <p className="text-muted-foreground">Real-time tracking from MS Dynamics 365</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
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
        {/* Filters */}
        <DashboardFilters filters={filters} onFilterChange={setFilters} />

        {/* KPI Summary */}
        <KPISummary 
          data={salesData.currentMonth}
          targets={salesData.targets}
          gapToSalesTarget={gapToSalesTarget}
          gapToGPTarget={gapToGPTarget}
          requiredAverageMargin={requiredAverageMargin}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target vs Actual */}
          <TargetActualChart 
            salesActual={salesData.currentMonth.totalSales}
            salesTarget={salesData.targets.monthlySales}
            gpActual={salesData.currentMonth.totalGP}
            gpTarget={salesData.targets.monthlyGP}
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
                <p className="text-lg font-bold text-primary">฿{gapToSalesTarget.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Remaining to reach monthly target</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-foreground">GP Gap</h4>
                <p className="text-lg font-bold text-destructive">฿{gapToGPTarget.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Remaining to reach GP target</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-foreground">Required Avg Margin</h4>
                <p className="text-lg font-bold text-orange-600">{requiredAverageMargin.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">For remaining orders to hit target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
