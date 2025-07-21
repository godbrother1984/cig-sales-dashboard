
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { ManualOrder } from '../types';

interface OrdersTableProps {
  orders: ManualOrder[];
  onRemoveOrder: (id: string) => void;
  isLoading?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  onRemoveOrder, 
  isLoading = false 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Manual Orders ({orders.length})
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && orders.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No manual orders added yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Business Unit</th>
                  <th className="text-right p-2">Order Value</th>
                  <th className="text-right p-2">Margin %</th>
                  <th className="text-right p-2">Gross Profit</th>
                  <th className="text-left p-2">Salesperson</th>
                  <th className="text-center p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="p-2">{order.orderDate}</td>
                    <td className="p-2">{order.customerName}</td>
                    <td className="p-2">{order.businessUnit}</td>
                    <td className="p-2 text-right">฿{order.orderValue.toLocaleString()}</td>
                    <td className="p-2 text-right">{order.grossMargin.toFixed(1)}%</td>
                    <td className="p-2 text-right">฿{order.grossProfit.toLocaleString()}</td>
                    <td className="p-2">{order.salesperson}</td>
                    <td className="p-2 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemoveOrder(order.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
