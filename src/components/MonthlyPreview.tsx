
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BarChart } from 'lucide-react';

interface MonthlyPreviewProps {
  previewTargets: { sales: number[]; gp: number[] };
  onApplyPreview: () => void;
  onCancelPreview: () => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthlyPreview: React.FC<MonthlyPreviewProps> = ({
  previewTargets,
  onApplyPreview,
  onCancelPreview
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Monthly Preview from Annual Targets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {months.map((month, index) => (
            <div key={month} className="text-center p-2 border rounded">
              <div className="font-semibold text-sm">{month}</div>
              <div className="text-xs text-muted-foreground">
                Sales: ฿{((previewTargets.sales[index] || 0) / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-muted-foreground">
                GP: ฿{((previewTargets.gp[index] || 0) / 1000000).toFixed(1)}M
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={onApplyPreview}>Apply These Targets</Button>
          <Button variant="outline" onClick={onCancelPreview}>
            Cancel Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
