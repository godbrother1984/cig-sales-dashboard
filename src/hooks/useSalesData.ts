import { useState, useEffect } from 'react';
import { combineDataWithManualOrders } from '../utils/dataCombination';
import { ManualOrder, DashboardFilters, Targets } from '../types';
import { DynamicsApiService, SalesDataParams } from '../services/dynamicsApiService';
import { transformApiDataToExpectedFormat, getEmptyDataStructure } from '../utils/apiDataTransformer';
import { toast } from '@/hooks/use-toast';

export const useSalesData = (
  filters: DashboardFilters,
  selectedMonth: number,
  viewMode: string,
  targets: Targets,
  refreshTrigger?: number
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
    // Get API endpoints from localStorage (from Settings page)
    const savedEndpoints = localStorage.getItem('api_endpoints');
    let dynamicsEndpoint = null;

    if (savedEndpoints) {
      try {
        const endpoints = JSON.parse(savedEndpoints);
        dynamicsEndpoint = endpoints.find((ep: any) => ep.id === 'dynamics_api');
      } catch (error) {
        console.error('Error parsing API endpoints:', error);
      }
    }

    // Check if Dynamics API is enabled and has baseUrl
    if (!dynamicsEndpoint || !dynamicsEndpoint.isActive || !dynamicsEndpoint.baseUrl) {
      console.log('Dynamics API is disabled or not configured, using empty data structure');
      return getEmptyDataStructure();
    }

    try {
      const apiService = new DynamicsApiService({
        baseUrl: dynamicsEndpoint.baseUrl,
        apiKey: dynamicsEndpoint.apiKey || ''
      });

      // Build API parameters from current filters and selected month
      const selectedYear = parseInt(localStorage.getItem('selected_year') || new Date().getFullYear().toString());
      const companiesText = localStorage.getItem('companies_text') || 'CIG Group';
      const companiesList = companiesText.split(',').map(c => c.trim()).filter(c => c);

      console.log('Companies to fetch:', companiesList);

      // Fetch data for all companies and combine
      const allApiResponses = await Promise.allSettled(
        companiesList.map(async (company) => {
          const apiParams: SalesDataParams = {
            year: selectedYear,
            month: selectedMonth === 12 ? undefined : selectedMonth + 1, // Convert to 1-based month, 12 = all months
            businessUnit: filters.businessUnit !== 'all' ? filters.businessUnit : undefined,
            company: company
          };

          console.log('API parameters for', company, ':', apiParams);
          return await apiService.fetchSalesData(apiParams);
        })
      );

      // Combine successful responses
      const successfulResponses = allApiResponses
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      // Merge all API responses into a single dataset
      const combinedApiResponse = successfulResponses.reduce((acc, response) => {
        // Simple merge - you may need to customize this based on your API response structure
        if (!acc) return response;

        // Combine arrays if they exist
        if (response.data && Array.isArray(response.data)) {
          acc.data = [...(acc.data || []), ...response.data];
        }

        return acc;
      }, null);

      // Pass the business unit filter to the transformer
      const transformedData = transformApiDataToExpectedFormat(combinedApiResponse || {}, filters.businessUnit);
      
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
  }, [filters, targets, selectedMonth, viewMode, refreshTrigger]);

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
