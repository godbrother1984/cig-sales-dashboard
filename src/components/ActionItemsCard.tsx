
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ActionItemsCardProps {
  gapToSalesTarget: number;
  gapToGPTarget: number;
  requiredAverageMargin: number;
  viewMode: string;
}

export const ActionItemsCard: React.FC<ActionItemsCardProps> = ({
  gapToSalesTarget,
  gapToGPTarget,
  requiredAverageMargin,
  viewMode
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 bg-primary rounded-full"></div>
          Action Items & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-foreground">Sales Gap</h4>
            <p className="text-lg font-bold text-primary">฿{Math.max(gapToSalesTarget, 0).toLocaleString()}</p>
            <p className="text-xs text-foreground/70">Remaining to reach {viewMode} target</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-foreground">GP Gap</h4>
            <p className="text-lg font-bold text-destructive">฿{Math.max(gapToGPTarget, 0).toLocaleString()}</p>
            <p className="text-xs text-foreground/70">Remaining to reach GP target</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-foreground">Required Avg Margin</h4>
            <p className="text-lg font-bold text-orange-600">{requiredAverageMargin.toFixed(1)}%</p>
            <p className="text-xs text-foreground/70">For remaining orders to hit target</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
