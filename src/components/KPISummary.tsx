
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, CircleDollarSign, BarChart } from 'lucide-react';

interface KPISummaryProps {
  data: {
    totalSales: number;
    totalGP: number;
    totalOrders: number;
    averageMargin: number;
  };
  targets: {
    monthlySales: number;
    monthlyGP: number;
  };
  gapToSalesTarget: number;
  gapToGPTarget: number;
  requiredAverageMargin: number;
}

export const KPISummary: React.FC<KPISummaryProps> = ({
  data,
  targets,
  gapToSalesTarget,
  gapToGPTarget,
  requiredAverageMargin
}) => {
  const salesPercentage = (data.totalSales / targets.monthlySales) * 100;
  const gpPercentage = (data.totalGP / targets.monthlyGP) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Sales */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales (THB)</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">฿{data.totalSales.toLocaleString()}</div>
          <div className="flex items-center pt-1">
            <div className={`flex items-center text-xs ${salesPercentage >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {salesPercentage >= 100 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {salesPercentage.toFixed(1)}% of target
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Target: ฿{targets.monthlySales.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Total GP */}
      <Card className="border-l-4 border-l-secondary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross Profit (THB)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">฿{data.totalGP.toLocaleString()}</div>
          <div className="flex items-center pt-1">
            <div className={`flex items-center text-xs ${gpPercentage >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {gpPercentage >= 100 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {gpPercentage.toFixed(1)}% of target
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Target: ฿{targets.monthlyGP.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card className="border-l-4 border-l-accent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalOrders}</div>
          <div className="flex items-center pt-1">
            <div className="text-xs text-muted-foreground">
              Avg: ฿{(data.totalSales / data.totalOrders).toLocaleString()} per order
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg Margin: {data.averageMargin.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      <Card className="border-l-4 border-l-destructive">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gap to Target</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            ฿{Math.max(gapToSalesTarget, 0).toLocaleString()}
          </div>
          <div className="flex items-center pt-1">
            <div className="text-xs text-muted-foreground">
              GP Gap: ฿{Math.max(gapToGPTarget, 0).toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Need {requiredAverageMargin.toFixed(1)}% avg margin
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
