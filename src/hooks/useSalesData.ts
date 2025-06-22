
import { useState, useEffect } from 'react';
import { getSampleDynamicsData, combineDataWithManualOrders } from '../utils/dataUtils';
import { ManualOrder, DashboardFilters, Targets } from '../types';
import { DynamicsApiService } from '../services/dynamicsApiService';
import { ApiConfigService } from '../services/apiConfigService';
import { transformApiDataToExpectedFormat } from '../utils/apiDataTransformer';
import { toast } from '@/hooks/use-toast';

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
      
      // Clear any previous errors and show success if we had errors before
      if (apiError) {
        toast({
          title: "API Connection Restored",
          description: "Successfully connected to MS Dynamics API",
          variant: "default",
        });
      }
      setApiError(null);
      return transformedData;
      
    } catch (error) {
      console.error('API fetch failed, falling back to sample data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
      setApiError(errorMessage);
      
      // Show error toast notification
      toast({
        title: "API Connection Failed",
        description: `Failed to connect to MS Dynamics API: ${errorMessage}. Using sample data instead. Please check your API settings.`,
        variant: "destructive",
      });
      
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
        
        // Show error toast for any other errors
        toast({
          title: "Data Loading Error",
          description: "An unexpected error occurred while loading data. Using sample data instead.",
          variant: "destructive",
        });
        
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
