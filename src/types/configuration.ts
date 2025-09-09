// Configuration Type Definitions

export interface FieldMapping {
  [localField: string]: string; // JSONPath to API field
}

export interface MappingProfile {
  name: string;
  description: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  healthCheckInterval: number;
  fieldMappings: {
    salesData: FieldMapping;
    marginBands?: FieldMapping;
    orderData?: FieldMapping;
  };
}

export interface ApiConfiguration {
  profiles: { [key: string]: MappingProfile };
  activeProfile: string;
}

export interface KPICard {
  id: string;
  title: string;
  enabled: boolean;
  format: 'currency' | 'number' | 'percentage';
  icon: string;
  borderColor: 'primary' | 'secondary' | 'accent' | 'destructive';
  order: number;
}

export interface ChartConfiguration {
  enabled: boolean;
  height: number;
  colors?: { [key: string]: string };
  bands?: Array<{
    min: number;
    max: number;
    label: string;
    color: string;
  }>;
  showGridLines?: boolean;
}

export interface DashboardConfiguration {
  defaultView: 'monthly' | 'qtd' | 'ytd';
  defaultBusinessUnit: string;
  refreshInterval: number;
  kpiCards: KPICard[];
  charts: {
    targetActual: ChartConfiguration;
    marginBands: ChartConfiguration;
    trendChart: ChartConfiguration;
  };
}

export interface UIConfiguration {
  theme: {
    defaultMode: 'light' | 'dark';
    allowToggle: boolean;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  language: {
    default: string;
    supported: string[];
  };
  dateFormat: {
    display: string;
    api: string;
  };
  numberFormat: {
    currency: string;
    locale: string;
    decimals: number;
    thousandSeparator: string;
  };
  navigation: {
    showBreadcrumbs: boolean;
    enableBackButton: boolean;
    sidebarCollapsible: boolean;
  };
}

export interface BusinessUnit {
  id: string;
  label: string;
  enabled: boolean;
  color: string;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

export interface BusinessConfiguration {
  businessUnits: BusinessUnit[];
  targetSettings: {
    defaultInputMethod: 'monthly' | 'annual';
    defaultRolloverStrategy: 'none' | 'cumulative' | 'quarterly' | 'redistribute';
    allowBusinessUnitTargets: boolean;
    fiscalYearStart: string;
  };
  validationRules: {
    [field: string]: ValidationRule;
  };
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface AutoCalculation {
  from: string[];
  formula: string;
  condition?: string;
}

export interface FieldConfiguration {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea';
  label: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  helpText?: string;
  validation?: ValidationRule;
  options?: FieldOption[] | string; // string means reference to other config
  excludeOptions?: string[];
  autocomplete?: boolean;
  suggestions?: string[];
  format?: 'currency' | 'percentage';
  suffix?: string;
  step?: number;
  autoCalculate?: AutoCalculation;
  disabled?: boolean;
}

export interface FormSection {
  title: string;
  fields: string[];
}

export interface FormLayout {
  columns: number;
  sections: FormSection[];
}

export interface FormConfiguration {
  fields: FieldConfiguration[];
  layout: FormLayout;
}

export interface InputConfiguration {
  manualOrderForm: FormConfiguration;
  targetForm: FormConfiguration;
}

export interface SystemConfiguration {
  performance: {
    cacheTimeout: number;
    maxRetries: number;
    requestTimeout: number;
    enableOfflineCache: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableAnalytics: boolean;
    logApiCalls: boolean;
  };
  features: {
    realTimeUpdates: boolean;
    offlineMode: boolean;
    exportData: boolean;
    importData: boolean;
    autoSave: boolean;
    notifications: boolean;
  };
  security: {
    sessionTimeout: number;
    requireReauth: boolean;
    encryptLocalStorage: boolean;
  };
}

export interface AppConfiguration {
  version: string;
  lastUpdated: string;
  apiConfiguration: ApiConfiguration;
  dashboardConfiguration: DashboardConfiguration;
  userInterface: UIConfiguration;
  businessConfiguration: BusinessConfiguration;
  userInputConfiguration: InputConfiguration;
  systemConfiguration: SystemConfiguration;
}

export interface ConfigurationValidation {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface UserOverrides {
  [section: string]: Partial<any>;
}