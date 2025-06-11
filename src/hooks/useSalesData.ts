
import { useState, useEffect } from 'react';
import { getSampleDynamicsData, combineDataWithManualOrders } from '../utils/dataUtils';
import { ManualOrder, DashboardFilters, Targets } from '../types';

export const useSalesData = (
  filters: DashboardFilters,
  selectedMonth: number,
  viewMode: string,
  targets: Targets
) => {
  const [salesData, setSalesData] = useState(null);

  const loadManualOrders = (): ManualOrder[] => {
    const savedOrders = localStorage.getItem('manualOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const dynamicsData = getSampleDynamicsData();
        const manualOrders = loadManualOrders();
        const combinedData = combineDataWithManualOrders(
          dynamicsData, 
          manualOrders, 
          filters, 
          selectedMonth, 
          viewMode, 
          targets
        );
        setSalesData(combinedData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        const dynamicsData = getSampleDynamicsData();
        const manualOrders = loadManualOrders();
        const combinedData = combineDataWithManualOrders(
          dynamicsData, 
          manualOrders, 
          filters, 
          selectedMonth, 
          viewMode, 
          targets
        );
        setSalesData(combinedData);
      }
    };

    fetchSalesData();
    const interval = setInterval(fetchSalesData, 300000);
    return () => clearInterval(interval);
  }, [filters, targets, selectedMonth, viewMode]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'manualOrders') {
        const manualOrders = loadManualOrders();
        const dynamicsData = getSampleDynamicsData();
        const combinedData = combineDataWithManualOrders(
          dynamicsData, 
          manualOrders, 
          filters, 
          selectedMonth, 
          viewMode, 
          targets
        );
        setSalesData(combinedData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [filters, selectedMonth, viewMode, targets]);

  return salesData;
};
