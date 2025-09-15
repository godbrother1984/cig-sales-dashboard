
import React, { useState, useEffect } from 'react';
import { KPISummary } from '../components/KPISummary';
import { TargetActualChart } from '../components/TargetActualChart';
import { MarginBandChart } from '../components/MarginBandChart';
import { DashboardFilters } from '../components/DashboardFilters';
import { TrendChart } from '../components/TrendChart';
import { DashboardHeader } from '../components/DashboardHeader';
import { MonthYTDSelector } from '../components/MonthYTDSelector';
import { ActionItemsCard } from '../components/ActionItemsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Filter } from 'lucide-react';
import { useSalesData } from '../hooks/useSalesData';
import { Targets, DashboardFilters as DashboardFiltersType, EnhancedTargets } from '../types';
import { aggregateBusinessUnitTargets } from '../utils/targetCalculations';
import { getCurrentMonthIndex } from '../utils/monthAvailability';
import {
  extractAvailableCustomers,
  extractAvailableSalespeople,
  extractManualOrderCustomers,
  extractManualOrderSalespeople
} from '../utils/dataUtils';

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { salesData, isLoading } = useSalesData(filters, selectedMonth, viewMode, legacyTargets, refreshTrigger);

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

  // Get manual orders from localStorage to extract additional filter options
  const getManualOrders = () => {
    try {
      const savedOrders = localStorage.getItem('manualOrders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  };

  // Extract dynamic filter options from actual data
  const manualOrders = getManualOrders();
  const apiCustomers = salesData ? extractAvailableCustomers(salesData) : [];
  const apiSalespeople = salesData ? extractAvailableSalespeople(salesData) : [];
  const manualCustomers = extractManualOrderCustomers(manualOrders);
  const manualSalespeople = extractManualOrderSalespeople(manualOrders);

  // Combine and deduplicate options from both API and manual data
  const availableCustomers = Array.from(new Set([...apiCustomers, ...manualCustomers])).sort();
  const availableSalespeople = Array.from(new Set([...apiSalespeople, ...manualSalespeople])).sort();

  // Add "All" option if there are any options available
  const customers = availableCustomers.length > 0 ? ['All', ...availableCustomers] : ['All'];
  const salespeople = availableSalespeople.length > 0 ? ['All', ...availableSalespeople] : ['All'];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-6 py-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6 flex-wrap">
              {/* Period Section */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Period:</span>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">View:</label>
                  <select
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm w-24"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="qtd">QTD</option>
                    <option value="ytd">YTD</option>
                  </select>
                </div>
                {(viewMode === 'monthly' || viewMode === 'qtd') && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">
                      {viewMode === 'monthly' ? 'Month:' : 'Quarter End:'}
                    </label>
                    <select
                      className="px-3 py-2 border border-input bg-background rounded-md text-sm w-28"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map((month, index) => (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Year:</label>
                  <select
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm w-20"
                    onChange={(e) => {
                      localStorage.setItem('selected_year', e.target.value);
                      setRefreshTrigger(prev => prev + 1);
                    }}
                    defaultValue={new Date().getFullYear().toString()}
                  >
                    {Array.from({ length: 11 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return (
                        <option key={year} value={year}>
                          {year + 543}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Separator */}
              <div className="h-6 w-px bg-border"></div>

              {/* Filters Section */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Business Unit:</label>
                  <select
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm w-20"
                    value={filters.businessUnit === 'all' ? 'All' : filters.businessUnit}
                    onChange={(e) => setFilters(prev => ({ ...prev, businessUnit: e.target.value.toLowerCase() === 'all' ? 'all' : e.target.value }))}
                  >
                    {['All', 'Coil', 'Unit', 'M&E', 'HBPM', 'MKT'].map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Customer:</label>
                  <select
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm w-40"
                    value={filters.customerName === 'all' ? 'All' : filters.customerName}
                    onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value.toLowerCase() === 'all' ? 'all' : e.target.value }))}
                  >
                    {customers.map(customer => (
                      <option key={customer} value={customer}>{customer}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Salesperson:</label>
                  <select
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm w-32"
                    value={filters.salesperson === 'all' ? 'All' : filters.salesperson}
                    onChange={(e) => setFilters(prev => ({ ...prev, salesperson: e.target.value.toLowerCase() === 'all' ? 'all' : e.target.value }))}
                  >
                    {salespeople.map(person => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Summary Cards */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">KPI Summary Cards</h2>
          <KPISummary
            data={salesData.currentMonth}
            targets={currentTargets}
            gapToSalesTarget={gapToSalesTarget}
            gapToGPTarget={gapToGPTarget}
            requiredAverageMargin={requiredAverageMargin}
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TargetActualChart
              salesActual={salesData.currentMonth.totalSales}
              salesTarget={currentTargets.sales}
              gpActual={salesData.currentMonth.totalGP}
              gpTarget={currentTargets.gp}
            />
            <MarginBandChart data={salesData.marginBands} />
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">Monthly Trend Analysis</h2>
          <TrendChart data={salesData.monthlyTrend} />
        </div>

        {/* Action Items */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">Action Items</h2>
          <ActionItemsCard
            gapToSalesTarget={gapToSalesTarget}
            gapToGPTarget={gapToGPTarget}
            requiredAverageMargin={requiredAverageMargin}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
