
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getMonthNames } from '../utils/targetCalculations';

interface MonthlyTargetsInputProps {
  salesTargets: number[];
  gpTargets: number[];
  onSalesTargetChange: (month: number, value: number) => void;
  onGPTargetChange: (month: number, value: number) => void;
}

export const MonthlyTargetsInput: React.FC<MonthlyTargetsInputProps> = ({
  salesTargets,
  gpTargets,
  onSalesTargetChange,
  onGPTargetChange
}) => {
  const months = getMonthNames();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((month, index) => (
            <div key={month} className="space-y-3 p-3 border rounded-lg">
              <Label className="font-semibold text-sm">{month}</Label>
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`sales-${index}`} className="text-xs text-muted-foreground">
                    Sales Target (THB)
                  </Label>
                  <Input
                    id={`sales-${index}`}
                    type="number"
                    value={salesTargets[index] || 0}
                    onChange={(e) => onSalesTargetChange(index, parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor={`gp-${index}`} className="text-xs text-muted-foreground">
                    GP Target (THB)
                  </Label>
                  <Input
                    id={`gp-${index}`}
                    type="number"
                    value={gpTargets[index] || 0}
                    onChange={(e) => onGPTargetChange(index, parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
