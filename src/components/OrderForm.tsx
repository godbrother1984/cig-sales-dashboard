
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus } from 'lucide-react';
import { ManualOrder } from '../types';

interface OrderFormProps {
  currentOrder: Partial<ManualOrder>;
  onInputChange: (field: keyof ManualOrder, value: string | number) => void;
  onAddOrder: () => void;
}

const salespeople = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Wong'];

export const OrderForm: React.FC<OrderFormProps> = ({
  currentOrder,
  onInputChange,
  onAddOrder
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orderDate">Order Date</Label>
            <Input
              id="orderDate"
              type="date"
              value={currentOrder.orderDate}
              onChange={(e) => onInputChange('orderDate', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={currentOrder.customerName}
              onChange={(e) => onInputChange('customerName', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Product Group</Label>
            <Select 
              value={currentOrder.productGroup} 
              onValueChange={(value) => onInputChange('productGroup', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HBPM">HBPM</SelectItem>
                <SelectItem value="M&E">M&E</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="orderValue">Order Value (THB) *</Label>
            <Input
              id="orderValue"
              type="number"
              value={currentOrder.orderValue || ''}
              onChange={(e) => onInputChange('orderValue', parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grossMargin">Gross Margin (%)</Label>
            <Input
              id="grossMargin"
              type="number"
              step="0.1"
              value={currentOrder.grossMargin || ''}
              onChange={(e) => onInputChange('grossMargin', parseFloat(e.target.value) || 0)}
              placeholder="0.0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grossProfit">Gross Profit (THB)</Label>
            <Input
              id="grossProfit"
              type="number"
              value={(currentOrder.grossProfit || 0).toFixed(2)}
              readOnly
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Salesperson *</Label>
            <Select 
              value={currentOrder.salesperson} 
              onValueChange={(value) => onInputChange('salesperson', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select salesperson" />
              </SelectTrigger>
              <SelectContent>
                {salespeople.map(person => (
                  <SelectItem key={person} value={person}>{person}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onAddOrder} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
