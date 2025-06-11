
import React, { useState, useEffect } from 'react';
import { KPISummary } from '../components/KPISummary';
import { TargetActualChart } from '../components/TargetActualChart';
import { MarginBandChart } from '../components/MarginBandChart';
import { DashboardFilters } from '../components/DashboardFilters';
import { TrendChart } from '../components/TrendChart';
import { DashboardHeader } from '../components/DashboardHeader';
import { MonthYTDSelector } from '../components/MonthYTDSelector';
import { ActionItemsCard } from '../components/ActionItemsCard';
import { useSalesData } from '../hooks/useSalesData';
import { Targets, DashboardFilters as DashboardFiltersType } from '../types';

const Index = () => {
  const [targets, setTargets] = useState<Targets>({
    monthlySales: 3200000,
    monthlyGP: 800000,
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

  const salesData = useSalesData(filters, selectedMonth, viewMode, targets);

  useEffect(() => {
    const savedTargets = localStorage.getItem('salesTargets');
    if (savedTargets) {
      const parsedTargets = JSON.parse(savedTargets);
      setTargets(parsedTargets);
    }
  }, []);

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
      <DashboardHeader />

      <div className="container mx-auto px-6 py-6 space-y-6">
        <MonthYTDSelector
          viewMode={viewMode}
          selectedMonth={selectedMonth}
          onViewModeChange={setViewMode}
          onMonthChange={setSelectedMonth}
        />

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
