
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ManualOrder {
  id: string;
  orderDate: string;
  customerName: string;
  productGroup: 'HBPM' | 'M&E';
  orderValue: number;
  grossMargin: number;
  grossProfit: number;
  salesperson: string;
}

const ManualEntry = () => {
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Partial<ManualOrder>>({
    orderDate: new Date().toISOString().split('T')[0],
    customerName: '',
    productGroup: 'HBPM',
    orderValue: 0,
    grossMargin: 0,
    grossProfit: 0,
    salesperson: ''
  });

  const salespeople = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Wong'];

  const handleInputChange = (field: keyof ManualOrder, value: string | number) => {
    setCurrentOrder(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate gross profit when order value or margin changes
      if (field === 'orderValue' || field === 'grossMargin') {
        const orderValue = field === 'orderValue' ? Number(value) : (updated.orderValue || 0);
        const margin = field === 'grossMargin' ? Number(value) : (updated.grossMargin || 0);
        updated.grossProfit = (orderValue * margin) / 100;
      }
      
      return updated;
    });
  };

  const addOrder = () => {
    if (currentOrder.customerName && currentOrder.orderValue && currentOrder.salesperson) {
      const newOrder: ManualOrder = {
        ...currentOrder as ManualOrder,
        id: Date.now().toString()
      };
      
      setOrders(prev => [...prev, newOrder]);
      
      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('manualOrders') || '[]');
      localStorage.setItem('manualOrders', JSON.stringify([...existingOrders, newOrder]));
      
      // Reset form
      setCurrentOrder({
        orderDate: new Date().toISOString().split('T')[0],
        customerName: '',
        productGroup: 'HBPM',
        orderValue: 0,
        grossMargin: 0,
        grossProfit: 0,
        salesperson: ''
      });
      
      alert('Order added successfully!');
    } else {
      alert('Please fill in all required fields');
    }
  };

  const removeOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
    
    // Update localStorage
    const updatedOrders = orders.filter(order => order.id !== id);
    localStorage.setItem('manualOrders', JSON.stringify(updatedOrders));
  };

  // Load existing orders on component mount
  React.useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('manualOrders') || '[]');
    setOrders(savedOrders);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manual Order Entry</h1>
              <p className="text-muted-foreground">Add HBPM and M&E orders manually</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Order Entry Form */}
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
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={currentOrder.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Product Group</Label>
                <Select 
                  value={currentOrder.productGroup} 
                  onValueChange={(value) => handleInputChange('productGroup', value)}
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
                <Label htmlFor="orderValue">Order Value (THB)</Label>
                <Input
                  id="orderValue"
                  type="number"
                  value={currentOrder.orderValue}
                  onChange={(e) => handleInputChange('orderValue', parseFloat(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grossMargin">Gross Margin (%)</Label>
                <Input
                  id="grossMargin"
                  type="number"
                  step="0.1"
                  value={currentOrder.grossMargin}
                  onChange={(e) => handleInputChange('grossMargin', parseFloat(e.target.value))}
                  placeholder="0.0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grossProfit">Gross Profit (THB)</Label>
                <Input
                  id="grossProfit"
                  type="number"
                  value={currentOrder.grossProfit?.toFixed(2)}
                  readOnly
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Salesperson</Label>
                <Select 
                  value={currentOrder.salesperson} 
                  onValueChange={(value) => handleInputChange('salesperson', value)}
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
              <Button onClick={addOrder} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No manual orders added yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-left p-2">Product Group</th>
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
                        <td className="p-2">{order.productGroup}</td>
                        <td className="p-2 text-right">฿{order.orderValue.toLocaleString()}</td>
                        <td className="p-2 text-right">{order.grossMargin.toFixed(1)}%</td>
                        <td className="p-2 text-right">฿{order.grossProfit.toLocaleString()}</td>
                        <td className="p-2">{order.salesperson}</td>
                        <td className="p-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeOrder(order.id)}
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
      </div>
    </div>
  );
};

export default ManualEntry;
