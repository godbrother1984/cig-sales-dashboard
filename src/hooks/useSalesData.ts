
import { useState, useEffect } from 'react';
import { getSampleDynamicsData, combineDataWithManualOrders } from '../utils/dataUtils';
import { ManualOrder, DashboardFilters, Targets } from '../types';
import { DynamicsApiService } from '../services/dynamicsApiService';
import { ApiConfigService } from '../services/apiConfigService';
import { transformApiDataToExpectedFormat } from '../utils/apiDataTransformer';

export const useSalesData = (
  filters: DashboardFilters,
  selectedMonth: number,
  viewMode: string,
  targets: Targets
) => {
  const [salesData, setSalesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadManualOrders = (): ManualOrder[] => {
    const savedOrders = localStorage.getItem('manualOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  };

  const fetchDataFromApi = async () => {
    const config = ApiConfigService.getConfig();
    
    if (!config.isEnabled) {
      console.log('API is disabled, using sample data');
      return getSampleDynamicsData();
    }

    try {
      const apiService = new DynamicsApiService({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey
      });

      const apiResponse = await apiService.fetchSalesData();
      const transformedData = transformApiDataToExpectedFormat(apiResponse);
      
      console.log('Successfully fetched and transformed API data');
      setApiError(null);
      return transformedData;
      
    } catch (error) {
      console.error('API fetch failed, falling back to sample data:', error);
      setApiError(error instanceof Error ? error.message : 'Unknown API error');
      return getSampleDynamicsData();
    }
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      try {
        const dynamicsData = await fetchDataFromApi();
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
        console.error('Error in fetchSalesData:', error);
        // Fallback to sample data
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
    const interval = setInterval(fetchSalesData, 300000);
    return () => clearInterval(interval);
  }, [filters, targets, selectedMonth, viewMode]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'manualOrders' || e.key === 'dynamics_api_config') {
        const fetchData = async () => {
          const dynamicsData = await fetchDataFromApi();
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
        };
        fetchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [filters, selectedMonth, viewMode, targets]);

  return { salesData, isLoading, apiError };
};
