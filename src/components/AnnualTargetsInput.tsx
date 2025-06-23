
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
            <Label htmlFor="annualSales">Annual Sales Target (THB)</Label>
            <Input
              id="annualSales"
              type="number"
              value={annualSales}
              onChange={(e) => onAnnualSalesChange(parseFloat(e.target.value) || 0)}
              placeholder="38,400,000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualGP">Annual GP Target (THB)</Label>
            <Input
              id="annualGP"
              type="number"
              value={annualGP}
              onChange={(e) => onAnnualGPChange(parseFloat(e.target.value) || 0)}
              placeholder="9,600,000"
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
                    value={weights[index]}
                    onChange={(e) => {
                      const newWeights = [...weights];
                      newWeights[index] = parseFloat(e.target.value) || 0;
                      onWeightsChange(newWeights);
                    }}
                    className="text-xs"
                    step="0.1"
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
