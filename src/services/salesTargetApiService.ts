
import { BaseApiService, ApiResponse } from './baseApiService';

export interface ApiSalesTarget {
  id: string;
  user_id: string;
  input_method: 'monthly' | 'annual';
  rollover_strategy: 'none' | 'cumulative' | 'quarterly' | 'redistribute';
  global_targets: boolean;
  selected_business_unit?: string;
  migration_version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSalesTargetData {
  user_id: string;
  input_method: 'monthly' | 'annual';
  rollover_strategy: 'none' | 'cumulative' | 'quarterly' | 'redistribute';
  global_targets: boolean;
  selected_business_unit?: string;
}

export class SalesTargetApiService extends BaseApiService {
  async createTarget(targetData: CreateSalesTargetData): Promise<ApiResponse<ApiSalesTarget>> {
    return this.request('/SalesdashboardSalesTarget/sales-targets', {
      method: 'POST',
      body: JSON.stringify(targetData)
    });
  }

  async getAllTargets(): Promise<ApiResponse<ApiSalesTarget>> {
    return this.request('/SalesdashboardSalesTarget/sales-targets');
  }

  async getTargetById(id: string): Promise<ApiResponse<ApiSalesTarget>> {
    return this.request(`/SalesdashboardSalesTarget/sales-targets/${id}`);
  }

  async updateTarget(id: string, updates: Partial<CreateSalesTargetData>): Promise<ApiResponse<ApiSalesTarget>> {
    return this.request(`/SalesdashboardSalesTarget/sales-targets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteTarget(id: string): Promise<ApiResponse<ApiSalesTarget>> {
    return this.request(`/SalesdashboardSalesTarget/sales-targets/${id}`, {
      method: 'DELETE'
    });
  }
}
