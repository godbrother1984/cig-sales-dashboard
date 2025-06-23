
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AnnualTargetsInputProps {
  annualSales: number;
  annualGP: number;
  distribution: 'equal' | 'weighted' | 'custom';
  weights?: number[];
  onAnnualSalesChange: (value: number) => void;
  onAnnualGPChange: (value: number) => void;
  onDistributionChange: (distribution: 'equal' | 'weighted' | 'custom') => void;
  onWeightsChange: (weights: number[]) => void;
  onPreviewMonthly: () => void;
}

export const AnnualTargetsInput: React.FC<AnnualTargetsInputProps> = ({
  annualSales,
  annualGP,
  distribution,
  weights = Array(12).fill(8.33),
  onAnnualSalesChange,
  onAnnualGPChange,
  onDistributionChange,
  onWeightsChange,
  onPreviewMonthly
}) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annual Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="annualSales">Annual Sales Target (Million THB)</Label>
            <Input
              id="annualSales"
              type="number"
              step="0.01"
              min="0"
              value={annualSales / 1000000}
              onChange={(e) => onAnnualSalesChange((parseFloat(e.target.value) || 0) * 1000000)}
              placeholder="38.4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualGP">Annual GP Target (Million THB)</Label>
            <Input
              id="annualGP"
              type="number"
              step="0.01"
              min="0"
              value={annualGP / 1000000}
              onChange={(e) => onAnnualGPChange((parseFloat(e.target.value) || 0) * 1000000)}
              placeholder="9.6"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Distribution Method</Label>
          <Select value={distribution} onValueChange={onDistributionChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">Equal Distribution (divide by 12)</SelectItem>
              <SelectItem value="weighted">Weighted Distribution (seasonal)</SelectItem>
              <SelectItem value="custom">Custom Distribution</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {distribution === 'custom' && (
          <div className="space-y-2">
            <Label>Monthly Weights (%)</Label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {months.map((month, index) => (
                <div key={month} className="space-y-1">
                  <Label className="text-xs">{month}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={weights[index]}
                    onChange={(e) => {
                      const newWeights = [...weights];
                      newWeights[index] = parseFloat(e.target.value) || 0;
                      onWeightsChange(newWeights);
                    }}
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {weights.reduce((sum, w) => sum + w, 0).toFixed(1)}% 
              (should equal 100%)
            </p>
          </div>
        )}

        <Button onClick={onPreviewMonthly} variant="outline" className="w-full">
          Preview Monthly Breakdown
        </Button>
      </CardContent>
    </Card>
  );
};
