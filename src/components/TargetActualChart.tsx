
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TargetActualChartProps {
  salesActual: number;
  salesTarget: number;
  gpActual: number;
  gpTarget: number;
}

export const TargetActualChart: React.FC<TargetActualChartProps> = ({
  salesActual,
  salesTarget,
  gpActual,
  gpTarget
}) => {
  const data = [
    {
      metric: 'Sales',
      Actual: salesActual / 1000000,
      Target: salesTarget / 1000000,
      percentage: (salesActual / salesTarget) * 100
    },
    {
      metric: 'Gross Profit',
      Actual: gpActual / 1000000,
      Target: gpTarget / 1000000,
      percentage: (gpActual / gpTarget) * 100
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">
            Actual: ฿{(payload[0].value * 1000000).toLocaleString()}
          </p>
          <p className="text-secondary">
            Target: ฿{(payload[1].value * 1000000).toLocaleString()}
          </p>
          <p className="text-muted-foreground">
            Achievement: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Target vs Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="metric" 
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: 'Million THB', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="Actual" 
              fill="hsl(var(--primary))" 
              name="Actual"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="Target" 
              fill="hsl(var(--secondary))" 
              name="Target"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
