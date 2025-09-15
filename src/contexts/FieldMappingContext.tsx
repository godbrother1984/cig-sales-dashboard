/**
 * File: src/contexts/FieldMappingContext.tsx
 * Version: 1.0.0
 * Date: 2025-09-13
 * Time: 10:15
 * Description: Context for managing API field mappings across the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FieldMapping {
  id: string;
  displayName: string;
  description: string;
  apiKey: string;
  apiEndpoint: string; // ระบุว่าดึงข้อมูลจาก API ไหน
  cardComponent: string;
  dataType: 'number' | 'string' | 'currency' | 'percentage';
  isRequired: boolean;
}

interface FieldMappingContextType {
  fieldMappings: FieldMapping[];
  getFieldMapping: (id: string) => FieldMapping | undefined;
  getFieldMappingsByComponent: (component: string) => FieldMapping[];
  getApiKey: (id: string) => string;
  updateFieldMappings: (mappings: FieldMapping[]) => void;
  reloadMappings: () => void;
}

const FieldMappingContext = createContext<FieldMappingContextType | undefined>(undefined);

interface FieldMappingProviderProps {
  children: ReactNode;
}

export const FieldMappingProvider: React.FC<FieldMappingProviderProps> = ({ children }) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

  const loadMappings = () => {
    const savedMappings = localStorage.getItem('field_mappings');
    if (savedMappings) {
      try {
        const mappings = JSON.parse(savedMappings);
        setFieldMappings(mappings);
      } catch (error) {
        console.error('Error loading field mappings:', error);
        initializeDefaultMappings();
      }
    } else {
      initializeDefaultMappings();
    }
  };

  const initializeDefaultMappings = () => {
    const defaultMappings: FieldMapping[] = [
      // KPI Summary Card mappings
      {
        id: 'total_sales',
        displayName: 'ยอดขายรวม (THB)',
        description: 'ยอดขายรวมที่แสดงใน KPI Summary Card',
        apiKey: 'totalSales',
        apiEndpoint: 'legacy_api',
        cardComponent: 'KPISummary',
        dataType: 'currency',
        isRequired: true
      },
      {
        id: 'total_gp',
        displayName: 'กำไรขั้นต้นรวม (THB)',
        description: 'กำไรขั้นต้นรวมที่แสดงใน KPI Summary Card',
        apiKey: 'totalGP',
        apiEndpoint: 'legacy_api',
        cardComponent: 'KPISummary',
        dataType: 'currency',
        isRequired: true
      },
      {
        id: 'total_orders',
        displayName: 'จำนวนออเดอร์รวม',
        description: 'จำนวนออเดอร์รวมที่แสดงใน KPI Summary Card',
        apiKey: 'totalOrders',
        apiEndpoint: 'legacy_api',
        cardComponent: 'KPISummary',
        dataType: 'number',
        isRequired: true
      },
      {
        id: 'average_margin',
        displayName: 'มาร์จิ้นเฉลี่ย (%)',
        description: 'มาร์จิ้นเฉลี่ยที่แสดงใน KPI Summary Card',
        apiKey: 'averageMargin',
        apiEndpoint: 'legacy_api',
        cardComponent: 'KPISummary',
        dataType: 'percentage',
        isRequired: true
      },
      // Target mappings  
      {
        id: 'sales_target',
        displayName: 'เป้าหมายยอดขาย (THB)',
        description: 'เป้าหมายยอดขายสำหรับการคำนวณ % achievement',
        apiKey: 'salesTarget',
        apiEndpoint: 'legacy_api',
        cardComponent: 'KPISummary',
        dataType: 'currency',
        isRequired: true
      },
      {
        id: 'gp_target',
        displayName: 'เป้าหมายกำไรขั้นต้น (THB)',
        description: 'เป้าหมายกำไรขั้นต้นสำหรับการคำนวณ % achievement',
        apiKey: 'gpTarget',
        apiEndpoint: 'legacy_api',
        cardComponent: 'KPISummary',
        dataType: 'currency',
        isRequired: true
      },
      // Action Items Card mappings
      {
        id: 'gap_to_sales_target',
        displayName: 'ระยะห่างจากเป้ายอดขาย',
        description: 'จำนวนที่ขาดจากเป้าหมายยอดขายใน Action Items Card',
        apiKey: 'gapToSalesTarget',
        apiEndpoint: 'legacy_api',
        cardComponent: 'ActionItems',
        dataType: 'currency',
        isRequired: true
      },
      {
        id: 'gap_to_gp_target',
        displayName: 'ระยะห่างจากเป้ากำไรขั้นต้น',
        description: 'จำนวนที่ขาดจากเป้าหมายกำไรขั้นต้นใน Action Items Card',
        apiKey: 'gapToGPTarget',
        apiEndpoint: 'legacy_api',
        cardComponent: 'ActionItems',
        dataType: 'currency',
        isRequired: true
      },
      {
        id: 'required_avg_margin',
        displayName: 'มาร์จิ้นเฉลี่ยที่ต้องการ',
        description: 'มาร์จิ้นเฉลี่ยที่จำเป็นเพื่อบรรลุเป้าหมายใน Action Items Card',
        apiKey: 'requiredAverageMargin',
        apiEndpoint: 'legacy_api',
        cardComponent: 'ActionItems',
        dataType: 'percentage',
        isRequired: true
      },
      // Chart data mappings
      {
        id: 'monthly_data',
        displayName: 'ข้อมูลรายเดือน',
        description: 'Array ข้อมูลรายเดือนสำหรับ Charts',
        apiKey: 'monthlyData',
        apiEndpoint: 'dynamics_api',
        cardComponent: 'Charts',
        dataType: 'string',
        isRequired: false
      },
      {
        id: 'customer_name',
        displayName: 'ชื่อลูกค้า',
        description: 'ชื่อลูกค้าสำหรับการกรองและแสดงผล',
        apiKey: 'customerName',
        apiEndpoint: 'legacy_api',
        cardComponent: 'Filters',
        dataType: 'string',
        isRequired: false
      },
      {
        id: 'salesperson',
        displayName: 'พนักงานขาย',
        description: 'ชื่อพนักงานขายสำหรับการกรองและแสดงผล',
        apiKey: 'salesperson',
        apiEndpoint: 'legacy_api',
        cardComponent: 'Filters',
        dataType: 'string',
        isRequired: false
      }
    ];
    
    setFieldMappings(defaultMappings);
    localStorage.setItem('field_mappings', JSON.stringify(defaultMappings));
  };

  useEffect(() => {
    loadMappings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getFieldMapping = (id: string): FieldMapping | undefined => {
    return fieldMappings.find(mapping => mapping.id === id);
  };

  const getFieldMappingsByComponent = (component: string): FieldMapping[] => {
    return fieldMappings.filter(mapping => mapping.cardComponent === component);
  };

  const getApiKey = (id: string): string => {
    const mapping = getFieldMapping(id);
    return mapping?.apiKey || id;
  };

  const updateFieldMappings = (mappings: FieldMapping[]) => {
    setFieldMappings(mappings);
    localStorage.setItem('field_mappings', JSON.stringify(mappings));
  };

  const reloadMappings = () => {
    loadMappings();
  };

  const contextValue: FieldMappingContextType = {
    fieldMappings,
    getFieldMapping,
    getFieldMappingsByComponent,
    getApiKey,
    updateFieldMappings,
    reloadMappings
  };

  return (
    <FieldMappingContext.Provider value={contextValue}>
      {children}
    </FieldMappingContext.Provider>
  );
};

export const useFieldMapping = (): FieldMappingContextType => {
  const context = useContext(FieldMappingContext);
  if (!context) {
    throw new Error('useFieldMapping must be used within a FieldMappingProvider');
  }
  return context;
};

// Helper functions for common use cases
export const useApiKey = (fieldId: string): string => {
  const { getApiKey } = useFieldMapping();
  return getApiKey(fieldId);
};

export const useComponentMappings = (component: string): FieldMapping[] => {
  const { getFieldMappingsByComponent } = useFieldMapping();
  return getFieldMappingsByComponent(component);
};

// Utility function to map API response to component props based on field mappings
export const mapApiResponse = (apiResponse: Record<string, unknown>, mappings: FieldMapping[]): Record<string, unknown> => {
  const mapped: Record<string, unknown> = {};
  
  mappings.forEach(mapping => {
    const apiValue = apiResponse[mapping.apiKey];
    if (apiValue !== undefined) {
      // Apply data type formatting if needed
      switch (mapping.dataType) {
        case 'number':
          mapped[mapping.id] = typeof apiValue === 'number' ? apiValue : parseFloat(apiValue) || 0;
          break;
        case 'currency':
          mapped[mapping.id] = typeof apiValue === 'number' ? apiValue : parseFloat(apiValue) || 0;
          break;
        case 'percentage':
          mapped[mapping.id] = typeof apiValue === 'number' ? apiValue : parseFloat(apiValue) || 0;
          break;
        default:
          mapped[mapping.id] = apiValue;
      }
    }
  });
  
  return mapped;
};