
import React from 'react';

// MS Dynamics 365 Integration Guide and Data Structure
export interface SalesOrderData {
  orderId: string;
  orderDate: string;
  customerName: string;
  businessUnit: string;
  orderValue: number; // in THB
  grossMargin: number; // percentage
  grossProfit: number; // in THB
  salesperson: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
}

export interface TargetData {
  period: string; // 'YYYY-MM' format
  targetSales: number; // in THB
  targetGP: number; // in THB
}

// Sample API integration functions for MS Dynamics 365
export class MSDataService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Fetch sales orders from MS Dynamics 365
  async fetchSalesOrders(filters?: {
    startDate?: string;
    endDate?: string;
    businessUnit?: string;
    customerName?: string;
    salesperson?: string;
  }): Promise<SalesOrderData[]> {
    try {
      const queryParams = new URLSearchParams();
      
      // Build OData query for MS Dynamics 365
      let filter = `CreatedOn ge ${filters?.startDate || new Date().toISOString().slice(0, 7) + '-01'}`;
      
      if (filters?.endDate) {
        filter += ` and CreatedOn le ${filters.endDate}`;
      }
      
      if (filters?.businessUnit && filters.businessUnit !== 'all') {
        filter += ` and BusinessUnit eq '${filters.businessUnit}'`;
      }
      
      if (filters?.customerName && filters.customerName !== 'all') {
        filter += ` and CustomerName eq '${filters.customerName}'`;
      }

      if (filters?.salesperson && filters.salesperson !== 'all') {
        filter += ` and SalesPerson eq '${filters.salesperson}'`;
      }

      queryParams.append('$filter', filter);
      queryParams.append('$select', 'SalesId,CreatedOn,CustomerName,BusinessUnit,TotalAmount,GrossMargin,GrossProfit,SalesPerson,Status');

      // Example API endpoint for MS Dynamics 365
      // Replace with your actual endpoint
      const response = await fetch(`${this.baseUrl}/data/SalesOrders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform MS Dynamics data to our interface
      return data.value.map((order: any) => ({
        orderId: order.SalesId,
        orderDate: order.CreatedOn,
        customerName: order.CustomerName,
        businessUnit: order.BusinessUnit,
        orderValue: order.TotalAmount,
        grossMargin: order.GrossMargin,
        grossProfit: order.GrossProfit,
        salesperson: order.SalesPerson,
        status: order.Status
      }));
      
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      throw error;
    }
  }

  // Fetch targets from MS Dynamics 365 or a separate target table
  async fetchTargets(period: string): Promise<TargetData> {
    try {
      const response = await fetch(`${this.baseUrl}/data/SalesTargets?$filter=Period eq '${period}'`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      return {
        period: period,
        targetSales: data.value[0]?.TargetSales || 0,
        targetGP: data.value[0]?.TargetGP || 0
      };
      
    } catch (error) {
      console.error('Error fetching targets:', error);
      throw error;
    }
  }
}

// Usage example and setup instructions
export const MSDataIntegrationGuide = () => {
  return (
    <div className="p-6 bg-card rounded-lg border">
      <h2 className="text-xl font-bold mb-4">MS Dynamics 365 Integration Setup</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">1. Required Data Structure in MS Dynamics 365:</h3>
          <div className="bg-muted p-3 rounded text-sm font-mono">
            <p>SalesOrders Table:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>SalesId (Primary Key)</li>
              <li>CreatedOn (DateTime)</li>
              <li>CustomerName (Text)</li>
              <li>BusinessUnit (Text)</li>
              <li>TotalAmount (Decimal)</li>
              <li>GrossMargin (Decimal - Percentage)</li>
              <li>GrossProfit (Decimal)</li>
              <li>SalesPerson (Text)</li>
              <li>Status (Text)</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">2. API Endpoint Configuration:</h3>
          <div className="bg-muted p-3 rounded text-sm">
            <p>Base URL: https://yourcompany.operations.dynamics.com/data/</p>
            <p>Authentication: OAuth 2.0 Bearer Token</p>
            <p>Protocol: OData v4</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">3. Required Permissions:</h3>
          <ul className="list-disc list-inside text-sm">
            <li>Read access to Sales Orders</li>
            <li>Read access to Customer Master</li>
            <li>Read access to Business Units</li>
            <li>Read access to Sales Targets (if applicable)</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">4. Environment Variables Needed:</h3>
          <div className="bg-muted p-3 rounded text-sm font-mono">
            <p>DYNAMICS_BASE_URL=https://yourcompany.operations.dynamics.com</p>
            <p>DYNAMICS_CLIENT_ID=your-client-id</p>
            <p>DYNAMICS_CLIENT_SECRET=your-client-secret</p>
            <p>DYNAMICS_TENANT_ID=your-tenant-id</p>
          </div>
        </div>
      </div>
    </div>
  );
};
