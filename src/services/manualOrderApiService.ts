
import { BaseApiService, ApiResponse } from './baseApiService';

export interface ApiManualOrder {
  id: string;
  user_id: string | { id: string; email: string; name: string };
  order_date: string;
  customer_name: string;
  business_unit: 'Coil' | 'Unit' | 'M&E' | 'HBPM' | 'MKT';
  order_value: number;
  gross_margin: number;
  gross_profit: number;
  salesperson: string;
  created_at: string;
  updated_at: string;
}

export interface CreateManualOrderData {
  user_id: string;
  order_date: string;
  customer_name: string;
  business_unit: 'Coil' | 'Unit' | 'M&E' | 'HBPM' | 'MKT';
  order_value: number;
  gross_margin: number;
  gross_profit: number;
  salesperson: string;
}

export class ManualOrderApiService extends BaseApiService {
  async createOrder(orderData: CreateManualOrderData): Promise<ApiResponse<ApiManualOrder>> {
    return this.request('/SalesdashboardManualOrder/manual-orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getAllOrders(): Promise<ApiResponse<ApiManualOrder>> {
    return this.request('/SalesdashboardManualOrder/manual-orders');
  }

  async getOrderById(id: string): Promise<ApiResponse<ApiManualOrder>> {
    return this.request(`/SalesdashboardManualOrder/manual-orders/${id}`);
  }

  async updateOrder(id: string, updates: Partial<CreateManualOrderData>): Promise<ApiResponse<ApiManualOrder>> {
    return this.request(`/SalesdashboardManualOrder/manual-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteOrder(id: string): Promise<ApiResponse<ApiManualOrder>> {
    return this.request(`/SalesdashboardManualOrder/manual-orders/${id}`, {
      method: 'DELETE'
    });
  }
}
