
import { ConfigurationService } from './configurationService';
import { ApiMappingService, MappedData } from './apiMappingService';

export interface DynamicsApiResponse {
  result: boolean;
  datas: {
    invoice: Array<{
      month: string;
      dataArea: string;
      bu: string;
      total_inv: number;
      total_inv_amount: number;
      gross_profit: number;
      margin: number;
      inv_margin_below_10: number;
      inv_margin_10_to_20: number;
      inv_margin_above_20: number;
    }>;
    sales_order: Array<{
      month: string;
      dataArea: string;
      bu: string;
      total_so: number;
      total_so_amount: number;
      gross_profit: number;
      margin: number;
    }>;
  };
  canChange: boolean;
  errors: any;
}

export interface MappedSalesData {
  totalSales: number;
  totalGP: number;
  totalOrders: number;
  averageMargin: number;
  month: string;
  businessUnit: string;
  dataArea: string;
}

export interface MappedMarginData {
  below10: number;
  between10_20: number;
  above20: number;
  month: string;
  businessUnit: string;
}

export class DynamicsApiService {
  private mappingService: ApiMappingService;

  constructor() {
    this.mappingService = ApiMappingService.getInstance();
  }

  async fetchSalesData(year: number = new Date().getFullYear()): Promise<DynamicsApiResponse> {
    try {
      const profile = await ConfigurationService.getActiveApiProfile();
      const url = `${profile.baseUrl}?year=${year}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log('Fetching sales data from:', url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), profile.timeout);

      let retryCount = 0;
      let lastError: Error;

      while (retryCount <= profile.retryAttempts) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('API Response received:', data);

          return data;

        } catch (error) {
          lastError = error as Error;
          retryCount++;
          
          if (retryCount <= profile.retryAttempts) {
            console.log(`Retry attempt ${retryCount}/${profile.retryAttempts} for API call`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      throw lastError!;

    } catch (error) {
      console.error('Error fetching sales data from API:', error);
      throw error;
    }
  }

  async getMappedSalesData(year: number = new Date().getFullYear()): Promise<MappedSalesData[]> {
    const rawData = await this.fetchSalesData(year);
    const mapped = await this.mappingService.mapApiResponse(rawData, 'salesData');
    return mapped as MappedSalesData[];
  }

  async getMappedMarginData(year: number = new Date().getFullYear()): Promise<MappedMarginData[]> {
    const rawData = await this.fetchSalesData(year);
    const mapped = await this.mappingService.mapApiResponse(rawData, 'marginBands');
    return mapped as MappedMarginData[];
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.fetchSalesData();
      return true;
    } catch (error) {
      return false;
    }
  }

  async testMappingConfiguration(): Promise<{
    success: boolean;
    salesDataSample?: MappedSalesData;
    marginDataSample?: MappedMarginData;
    errors: string[];
  }> {
    const errors: string[] = [];
    let salesDataSample: MappedSalesData | undefined;
    let marginDataSample: MappedMarginData | undefined;

    try {
      const rawData = await this.fetchSalesData();

      // Test sales data mapping
      try {
        const salesValidation = await this.mappingService.validateMapping(rawData, 'salesData');
        if (!salesValidation.valid) {
          errors.push(...salesValidation.errors);
        }
        if (salesValidation.sampleMapping) {
          salesDataSample = salesValidation.sampleMapping as MappedSalesData;
        }
      } catch (error) {
        errors.push(`Sales data mapping error: ${error.message}`);
      }

      // Test margin data mapping
      try {
        const marginValidation = await this.mappingService.validateMapping(rawData, 'marginBands');
        if (!marginValidation.valid) {
          errors.push(...marginValidation.errors);
        }
        if (marginValidation.sampleMapping) {
          marginDataSample = marginValidation.sampleMapping as MappedMarginData;
        }
      } catch (error) {
        errors.push(`Margin data mapping error: ${error.message}`);
      }

      return {
        success: errors.length === 0,
        salesDataSample,
        marginDataSample,
        errors
      };

    } catch (error) {
      return {
        success: false,
        errors: [`API connection failed: ${error.message}`]
      };
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'partial';
    apiConnection: boolean;
    mappingValid: boolean;
    lastChecked: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    let apiConnection = false;
    let mappingValid = false;

    // Test API connection
    try {
      apiConnection = await this.testConnection();
    } catch (error) {
      errors.push(`API connection failed: ${error.message}`);
    }

    // Test mapping configuration
    if (apiConnection) {
      try {
        const mappingTest = await this.testMappingConfiguration();
        mappingValid = mappingTest.success;
        if (!mappingValid) {
          errors.push(...mappingTest.errors);
        }
      } catch (error) {
        errors.push(`Mapping test failed: ${error.message}`);
      }
    }

    let status: 'healthy' | 'unhealthy' | 'partial';
    if (apiConnection && mappingValid) {
      status = 'healthy';
    } else if (apiConnection || mappingValid) {
      status = 'partial';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      apiConnection,
      mappingValid,
      lastChecked: new Date().toISOString(),
      errors
    };
  }
}
