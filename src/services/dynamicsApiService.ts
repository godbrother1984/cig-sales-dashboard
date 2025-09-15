
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

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface SalesDataParams {
  year?: number;
  month?: number;
  company?: string;
  businessUnit?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export class DynamicsApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 10000,
      ...config
    };
  }

  async fetchSalesData(params: SalesDataParams = {}): Promise<DynamicsApiResponse> {
    try {
      // Set default values
      const {
        year = new Date().getFullYear(),
        month,
        company,
        businessUnit,
        dateRange
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('year', year.toString());

      if (month !== undefined) {
        queryParams.append('month', month.toString());
      }

      if (company) {
        queryParams.append('company', company);
      }

      if (businessUnit) {
        queryParams.append('businessUnit', businessUnit);
      }

      if (dateRange) {
        queryParams.append('startDate', dateRange.startDate);
        queryParams.append('endDate', dateRange.endDate);
      }

      const url = `${this.config.baseUrl}?${queryParams.toString()}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      console.log('Fetching sales data from:', url);
      console.log('Request parameters:', params);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

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
      console.error('Error fetching sales data from API:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.fetchSalesData();
      return true;
    } catch (error) {
      return false;
    }
  }
}
