import React, { useState, useEffect } from 'react';
import { KPISummary } from '../components/KPISummary';
import { TargetActualChart } from '../components/TargetActualChart';
import { MarginBandChart } from '../components/MarginBandChart';
import { DashboardFilters } from '../components/DashboardFilters';
import { TrendChart } from '../components/TrendChart';
import { DashboardHeader } from '../components/DashboardHeader';
import { MonthYTDSelector } from '../components/MonthYTDSelector';
import { ActionItemsCard } from '../components/ActionItemsCard';
import { ApiConfigurationPanel } from '../components/ApiConfiguration';
import { useSalesData } from '../hooks/useSalesData';
import { Targets, DashboardFilters as DashboardFiltersType } from '../types';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Index = () => {
  const [targets, setTargets] = useState<Targets>({
    monthlySales: 3200000,
    monthlyGP: 800000,
    quarterlySales: 9600000,
    quarterlyGP: 2400000,
    ytdSales: 15000000,
    ytdGP: 3500000
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState('monthly');
  const [filters, setFilters] = useState<DashboardFiltersType>({
    productGroup: 'all',
    customerName: 'all',
    salesperson: 'all'
  });

  const { salesData, isLoading, apiError } = useSalesData(filters, selectedMonth, viewMode, targets);

  useEffect(() => {
    const savedTargets = localStorage.getItem('salesTargets');
    if (savedTargets) {
      const parsedTargets = JSON.parse(savedTargets);
      const updatedTargets = {
        ...parsedTargets,
        quarterlySales: parsedTargets.quarterlySales || parsedTargets.monthlySales * 3,
        quarterlyGP: parsedTargets.quarterlyGP || parsedTargets.monthlyGP * 3
      };
      setTargets(updatedTargets);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
          {apiError && (
            <p className="text-sm text-orange-600 mt-2">
              API connection failed, using sample data
            </p>
          )}
        </div>
      </div>
    );
  }

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

  const getCurrentTargets = () => {
    if (viewMode === 'monthly') {
      return { sales: targets.monthlySales, gp: targets.monthlyGP };
    } else if (viewMode === 'qtd') {
      return { sales: targets.quarterlySales, gp: targets.quarterlyGP };
    } else {
      return { sales: targets.ytdSales, gp: targets.ytdGP };
    }
  };

  const currentTargets = getCurrentTargets();
  const gapToSalesTarget = currentTargets.sales - salesData.currentMonth.totalSales;
  const gapToGPTarget = currentTargets.gp - salesData.currentMonth.totalGP;
  const requiredAverageMargin = gapToSalesTarget > 0 ? (gapToGPTarget / gapToSalesTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-6 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <MonthYTDSelector
            viewMode={viewMode}
            selectedMonth={selectedMonth}
            onViewModeChange={setViewMode}
            onMonthChange={setSelectedMonth}
          />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                API Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>API Configuration</DialogTitle>
              </DialogHeader>
              <ApiConfigurationPanel />
            </DialogContent>
          </Dialog>
        </div>

        {apiError && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm">
              <strong>API Notice:</strong> {apiError}. Currently displaying sample data.
            </p>
          </div>
        )}

        <DashboardFilters filters={filters} onFilterChange={setFilters} />

        <KPISummary 
          data={salesData.currentMonth}
          targets={currentTargets}
          gapToSalesTarget={gapToSalesTarget}
          gapToGPTarget={gapToGPTarget}
          requiredAverageMargin={requiredAverageMargin}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TargetActualChart 
            salesActual={salesData.currentMonth.totalSales}
            salesTarget={currentTargets.sales}
            gpActual={salesData.currentMonth.totalGP}
            gpTarget={currentTargets.gp}
          />
          <MarginBandChart data={salesData.marginBands} />
        </div>

        <TrendChart data={salesData.monthlyTrend} />

        <ActionItemsCard
          gapToSalesTarget={gapToSalesTarget}
          gapToGPTarget={gapToGPTarget}
          requiredAverageMargin={requiredAverageMargin}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default Index;
