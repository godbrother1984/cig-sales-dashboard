
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';
import { ManualOrder } from '../types';
import { ManualOrderApiService, CreateManualOrderData } from '../services/manualOrderApiService';

export const useManualOrders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<ManualOrder>>({
    orderDate: new Date().toISOString().split('T')[0],
    customerName: '',
    businessUnit: 'Coil',
    orderValue: 0,
    grossMargin: 0,
    grossProfit: 0,
    salesperson: ''
  });

  const manualOrderApi = new ManualOrderApiService();

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await manualOrderApi.getAllOrders();
      
      if (response.result && response.datas) {
        // Transform API response to match our ManualOrder interface
        const transformedOrders: ManualOrder[] = response.datas.map(apiOrder => ({
          id: apiOrder.id,
          orderDate: apiOrder.order_date,
          customerName: apiOrder.customer_name,
          businessUnit: apiOrder.business_unit,
          orderValue: apiOrder.order_value,
          grossMargin: apiOrder.gross_margin,
          grossProfit: apiOrder.gross_profit,
          salesperson: apiOrder.salesperson
        }));
        
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      
      // Fallback to localStorage for offline mode
      try {
        const savedOrders = localStorage.getItem('manualOrders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      } catch (storageError) {
        console.error('Error loading from localStorage:', storageError);
      }
      
      toast({
        title: "Connection Error",
        description: "Failed to load orders from server. Using local data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const addOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add orders.",
        variant: "destructive",
      });
      return;
    }

    if (currentOrder.customerName && currentOrder.orderValue && currentOrder.salesperson) {
      try {
        setIsLoading(true);

        const orderData: CreateManualOrderData = {
          user_id: user.id,
          order_date: currentOrder.orderDate!,
          customer_name: currentOrder.customerName,
          business_unit: currentOrder.businessUnit!,
          order_value: currentOrder.orderValue,
          gross_margin: currentOrder.grossMargin || 0,
          gross_profit: currentOrder.grossProfit || 0,
          salesperson: currentOrder.salesperson
        };

        const response = await manualOrderApi.createOrder(orderData);
        
        if (response.result && response.data) {
          // Transform API response and add to local state
          const newOrder: ManualOrder = {
            id: response.data.id,
            orderDate: response.data.order_date,
            customerName: response.data.customer_name,
            businessUnit: response.data.business_unit,
            orderValue: response.data.order_value,
            grossMargin: response.data.gross_margin,
            grossProfit: response.data.gross_profit,
            salesperson: response.data.salesperson
          };
          
          setOrders(prev => [...prev, newOrder]);
          
          // Reset form
          setCurrentOrder({
            orderDate: new Date().toISOString().split('T')[0],
            customerName: '',
            businessUnit: 'Coil',
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
          throw new Error(response.errors?.[0]?.message || 'Failed to create order');
        }
      } catch (error) {
        console.error('Error creating order:', error);
        
        // Fallback to localStorage
        const newOrder: ManualOrder = {
          ...currentOrder as ManualOrder,
          id: Date.now().toString()
        };
        
        setOrders(prev => [...prev, newOrder]);
        
        const existingOrders = JSON.parse(localStorage.getItem('manualOrders') || '[]');
        localStorage.setItem('manualOrders', JSON.stringify([...existingOrders, newOrder]));
        
        toast({
          title: "Offline Mode",
          description: "Order saved locally. Will sync when connection is restored.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Customer Name, Order Value, and Salesperson)",
        variant: "destructive",
      });
    }
  };

  const removeOrder = async (id: string) => {
    try {
      setIsLoading(true);
      await manualOrderApi.deleteOrder(id);
      
      setOrders(prev => prev.filter(order => order.id !== id));
      
      toast({
        title: "Order Removed",
        description: "Order has been successfully removed.",
      });
    } catch (error) {
      console.error('Error removing order:', error);
      
      // Fallback to localStorage
      const updatedOrders = orders.filter(order => order.id !== id);
      setOrders(updatedOrders);
      localStorage.setItem('manualOrders', JSON.stringify(updatedOrders));
      
      toast({
        title: "Offline Removal",
        description: "Order removed locally. Will sync when connection is restored.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  return {
    orders,
    currentOrder,
    isLoading,
    handleInputChange,
    addOrder,
    removeOrder
  };
};
