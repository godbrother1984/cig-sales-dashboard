
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface MonthYTDSelectorProps {
  viewMode: string;
  selectedMonth: number;
  onViewModeChange: (mode: string) => void;
  onMonthChange: (month: number) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthYTDSelector: React.FC<MonthYTDSelectorProps> = ({
  viewMode,
  selectedMonth,
  onViewModeChange,
  onMonthChange
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">
              {viewMode === 'monthly' ? `${months[selectedMonth]} 2025` : 'Year-to-Date 2025'}
            </h2>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={onViewModeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
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
  );
};
