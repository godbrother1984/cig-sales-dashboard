
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { OrderForm } from '../components/OrderForm';
import { OrdersTable } from '../components/OrdersTable';
import { useManualOrders } from '../hooks/useManualOrders';

const ManualEntry = () => {
  const { orders, currentOrder, isLoading, handleInputChange, addOrder, removeOrder } = useManualOrders();

  return (
    <div className="min-h-screen bg-background">
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
        <OrderForm
          currentOrder={currentOrder}
          onInputChange={handleInputChange}
          onAddOrder={addOrder}
          isLoading={isLoading}
        />
        
        <OrdersTable 
          orders={orders} 
          onRemoveOrder={removeOrder}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ManualEntry;
