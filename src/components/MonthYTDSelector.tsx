
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getAvailableMonths } from '../utils/monthAvailability';

interface MonthYTDSelectorProps {
  viewMode: string;
  selectedMonth: number;
  onViewModeChange: (mode: string) => void;
  onMonthChange: (month: number) => void;
  salesData?: any;
  refreshTrigger?: number;
  setRefreshTrigger?: (value: React.SetStateAction<number>) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getQuarterInfo = (month: number) => {
  if (month <= 2) return { quarter: 'Q1', months: ['Jan', 'Feb', 'Mar'] };
  if (month <= 5) return { quarter: 'Q2', months: ['Apr', 'May', 'Jun'] };
  if (month <= 8) return { quarter: 'Q3', months: ['Jul', 'Aug', 'Sep'] };
  return { quarter: 'Q4', months: ['Oct', 'Nov', 'Dec'] };
};

export const MonthYTDSelector: React.FC<MonthYTDSelectorProps> = ({
  viewMode,
  selectedMonth,
  onViewModeChange,
  onMonthChange,
  salesData,
  refreshTrigger,
  setRefreshTrigger
}) => {
  // Get manual orders from localStorage
  const getManualOrders = () => {
    try {
      const savedOrders = localStorage.getItem('manualOrders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  };

  const manualOrders = getManualOrders();
  const availableMonthIndices = getAvailableMonths(salesData, manualOrders);

  const getDisplayTitle = () => {
    if (viewMode === 'monthly') {
      return `${months[selectedMonth]} 2025`;
    } else if (viewMode === 'qtd') {
      const quarterInfo = getQuarterInfo(selectedMonth);
      return `${quarterInfo.quarter} 2025 (Quarter-to-Date)`;
    } else {
      return 'Year-to-Date 2025';
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Period:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">View:</label>
            <Select value={viewMode} onValueChange={onViewModeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="qtd">QTD</SelectItem>
                <SelectItem value="ytd">YTD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'monthly' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Month:</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem
                      key={index}
                      value={index.toString()}
                      className={!availableMonthIndices.includes(index) ? 'text-muted-foreground' : ''}
                    >
                      {month}
                      {!availableMonthIndices.includes(index) && ' (No Data)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {viewMode === 'qtd' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Quarter End:</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem
                      key={index}
                      value={index.toString()}
                      className={!availableMonthIndices.includes(index) ? 'text-muted-foreground' : ''}
                    >
                      {month}
                      {!availableMonthIndices.includes(index) && ' (No Data)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Year:</label>
            <Select
              value={localStorage.getItem('selected_year') || new Date().getFullYear().toString()}
              onValueChange={(value) => {
                localStorage.setItem('selected_year', value);
                if (setRefreshTrigger) {
                  setRefreshTrigger(prev => prev + 1);
                }
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year + 543}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
