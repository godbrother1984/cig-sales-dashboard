import { useState, useEffect } from 'react';
import { combineDataWithManualOrders } from '../utils/dataCombination';
import { ManualOrder, DashboardFilters, Targets } from '../types';
import { DynamicsApiService } from '../services/dynamicsApiService';
import { ApiConfigService } from '../services/apiConfigService';
import { transformApiDataToExpectedFormat, getEmptyDataStructure } from '../utils/apiDataTransformer';
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
    try {
      const savedOrders = localStorage.getItem('manualOrders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch (error) {
      console.error('Error loading manual orders from localStorage:', error);
      return [];
    }
  };

  const fetchDataFromApi = async () => {
    const config = ApiConfigService.getConfig();
    
    if (!config.isEnabled) {
      console.log('API is disabled, using empty data structure');
      return getEmptyDataStructure();
    }

    try {
      const apiService = new DynamicsApiService({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey
      });

      const apiResponse = await apiService.fetchSalesData();
      // Pass the business unit filter to the transformer
      const transformedData = transformApiDataToExpectedFormat(apiResponse, filters.businessUnit);
      
      console.log('Successfully fetched and transformed API data with business unit filter:', filters.businessUnit);
      
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
      console.error('API fetch failed, using empty data structure:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
      setApiError(errorMessage);
      
      // Show error toast notification
      toast({
        title: "API Connection Failed",
        description: `Failed to connect to MS Dynamics API: ${errorMessage}. Showing manual entries only.`,
        variant: "destructive",
      });
      
      return getEmptyDataStructure();
    }
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      try {
        console.log('Starting to fetch sales data...');
        const dynamicsData = await fetchDataFromApi();
        const manualOrders = loadManualOrders();
        
        console.log('Combining data with manual orders...');
        const combinedData = combineDataWithManualOrders(
          dynamicsData, 
          manualOrders, 
          filters, 
          selectedMonth, 
          viewMode, 
          targets
        );
        
        console.log('Data combination completed, setting sales data...');
        setSalesData(combinedData);
      } catch (error) {
        console.error('Error in fetchSalesData:', error);
        
        // Show error toast for any other errors
        toast({
          title: "Data Loading Error",
          description: "An unexpected error occurred while loading data. Using empty data structure.",
          variant: "destructive",
        });
        
        // Fallback to empty data structure instead of sample data
        try {
          const dynamicsData = getEmptyDataStructure();
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
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
          // Set minimal data to prevent infinite loading
          setSalesData({
            currentMonth: { totalSales: 0, totalGP: 0, totalOrders: 0, averageMargin: 0 },
            targets: targets,
            marginBands: [],
            monthlyTrend: []
          });
        }
      } finally {
        console.log('Setting loading to false');
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
