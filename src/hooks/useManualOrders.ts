
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { ManualOrder } from '../types';

export const useManualOrders = () => {
  const { toast } = useToast();
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

  const handleInputChange = (field: keyof ManualOrder, value: string | number) => {
    setCurrentOrder(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'orderValue' || field === 'grossMargin') {
        const orderValue = field === 'orderValue' ? Number(value) || 0 : (updated.orderValue || 0);
        const margin = field === 'grossMargin' ? Number(value) || 0 : (updated.grossMargin || 0);
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
      
      const existingOrders = JSON.parse(localStorage.getItem('manualOrders') || '[]');
      localStorage.setItem('manualOrders', JSON.stringify([...existingOrders, newOrder]));
      
      setCurrentOrder({
        orderDate: new Date().toISOString().split('T')[0],
        customerName: '',
        productGroup: 'HBPM',
        orderValue: 0,
        grossMargin: 0,
        grossProfit: 0,
        salesperson: ''
      });
      
      toast({
        title: "Success",
        description: "Order added successfully!",
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Customer Name, Order Value, and Salesperson)",
        variant: "destructive",
      });
    }
  };

  const removeOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
    const updatedOrders = orders.filter(order => order.id !== id);
    localStorage.setItem('manualOrders', JSON.stringify(updatedOrders));
    
    toast({
      title: "Order Removed",
      description: "Order has been successfully removed.",
    });
  };

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('manualOrders') || '[]');
    setOrders(savedOrders);
  }, []);

  return {
    orders,
    currentOrder,
    handleInputChange,
    addOrder,
    removeOrder
  };
};
