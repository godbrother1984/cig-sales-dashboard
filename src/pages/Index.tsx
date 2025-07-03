
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
import { Targets, DashboardFilters as DashboardFiltersType, EnhancedTargets } from '../types';
import { aggregateBusinessUnitTargets } from '../utils/targetCalculations';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getCurrentMonthIndex } from '../utils/monthAvailability';

const Index = () => {
  const [enhancedTargets, setEnhancedTargets] = useState<EnhancedTargets | null>(null);
  const [legacyTargets, setLegacyTargets] = useState<Targets>({
    monthlySales: 3200000,
    monthlyGP: 800000,
    quarterlySales: 9600000,
    quarterlyGP: 2400000,
    ytdSales: 15000000,
    ytdGP: 3500000
  });
  
  // Set initial selected month to current month instead of always using current date
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthIndex());
  const [viewMode, setViewMode] = useState('monthly');
  const [filters, setFilters] = useState<DashboardFiltersType>({
    businessUnit: 'all',
    customerName: 'all',
    salesperson: 'all'
  });

  const { salesData, isLoading } = useSalesData(filters, selectedMonth, viewMode, legacyTargets);

  useEffect(() => {
    // Load enhanced targets first
    const savedEnhancedTargets = localStorage.getItem('enhancedSalesTargets');
    if (savedEnhancedTargets) {
      try {
        const parsed = JSON.parse(savedEnhancedTargets);
        console.log('Loaded enhanced targets:', parsed);
        setEnhancedTargets(parsed);
      } catch (error) {
        console.error('Error parsing enhanced targets:', error);
      }
    }
    
    // Load legacy targets as fallback
    const savedLegacyTargets = localStorage.getItem('salesTargets');
    if (savedLegacyTargets) {
      try {
        const parsedLegacy = JSON.parse(savedLegacyTargets);
        const updatedLegacyTargets = {
          ...parsedLegacy,
          quarterlySales: parsedLegacy.quarterlySales || parsedLegacy.monthlySales * 3,
          quarterlyGP: parsedLegacy.quarterlyGP || parsedLegacy.monthlyGP * 3
        };
        setLegacyTargets(updatedLegacyTargets);
      } catch (error) {
        console.error('Error parsing legacy targets:', error);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
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
    console.log('Getting current targets for business unit:', filters.businessUnit, 'viewMode:', viewMode);
    
    // Use enhanced targets if available
    if (enhancedTargets) {
      const aggregatedTargets = aggregateBusinessUnitTargets(
        enhancedTargets,
        filters.businessUnit,
        selectedMonth,
        viewMode
      );
      console.log('Using enhanced targets:', aggregatedTargets);
      return aggregatedTargets;
    }
    
    // Fallback to legacy targets
    console.log('Using legacy targets as fallback');
    if (viewMode === 'monthly') {
      return { sales: legacyTargets.monthlySales, gp: legacyTargets.monthlyGP };
    } else if (viewMode === 'qtd') {
      return { sales: legacyTargets.quarterlySales, gp: legacyTargets.quarterlyGP };
    } else {
      return { sales: legacyTargets.ytdSales, gp: legacyTargets.ytdGP };
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
            salesData={salesData}
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

        <DashboardFilters 
          filters={filters} 
          onFilterChange={setFilters}
          salesData={salesData}
        />

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
