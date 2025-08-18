
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
  salesData
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">
              {getDisplayTitle()}
            </h2>
            <div className="flex items-center gap-2">
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
              {viewMode === 'monthly' && (
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
              )}
              {viewMode === 'qtd' && (
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
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
