import { 
  AppConfiguration, 
  ConfigurationValidation, 
  UserOverrides,
  FormConfiguration,
  BusinessUnit,
  MappingProfile
} from '../types/configuration';

export class ConfigurationService {
  private static CONFIG_URL = '/app-config.json';
  private static STORAGE_KEY = 'app_configuration_overrides';
  private static config: AppConfiguration | null = null;
  private static listeners: ((config: AppConfiguration) => void)[] = [];

  // Load configuration (JSON file + localStorage overrides)
  static async loadConfiguration(): Promise<AppConfiguration> {
    if (this.config) return this.config;

    try {
      console.log('Loading configuration from:', this.CONFIG_URL);
      
      // 1. Load base config from JSON file
      const response = await fetch(this.CONFIG_URL);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      
      const baseConfig: AppConfiguration = await response.json();
      console.log('Base config loaded, version:', baseConfig.version);

      // 2. Apply user overrides from localStorage
      const userOverrides = this.getUserOverrides();
      this.config = this.mergeConfigurations(baseConfig, userOverrides);

      // 3. Notify listeners
      this.notifyListeners();

      console.log('Configuration loaded successfully');
      return this.config;

    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.config = this.getDefaultConfiguration();
      return this.config;
    }
  }

  // Get specific configuration section
  static async getConfig<T extends keyof AppConfiguration>(
    section: T
  ): Promise<AppConfiguration[T]> {
    const config = await this.loadConfiguration();
    return config[section];
  }

  // Update configuration section
  static async updateConfig<T extends keyof AppConfiguration>(
    section: T,
    updates: Partial<AppConfiguration[T]>
  ): Promise<void> {
    const config = await this.loadConfiguration();
    
    // Deep merge the updates
    config[section] = {
      ...config[section],
      ...updates
    } as AppConfiguration[T];
    
    this.config = config;

    // Save user changes to localStorage
    this.saveUserOverrides();
    
    // Notify listeners
    this.notifyListeners();

    console.log(`Configuration section '${section}' updated`);
  }

  // Get form configuration for dynamic forms
  static async getFormConfig(formName: string): Promise<FormConfiguration | null> {
    const inputConfig = await this.getConfig('userInputConfiguration');
    return inputConfig[formName as keyof typeof inputConfig] || null;
  }

  // Get business unit options with filtering
  static async getBusinessUnits(includeAll: boolean = true): Promise<BusinessUnit[]> {
    const bizConfig = await this.getConfig('businessConfiguration');
    let units = bizConfig.businessUnits.filter(bu => bu.enabled);
    
    if (!includeAll) {
      units = units.filter(bu => bu.id !== 'all');
    }
    
    return units;
  }

  // Get active API profile
  static async getActiveApiProfile(): Promise<MappingProfile> {
    const apiConfig = await this.getConfig('apiConfiguration');
    const activeProfileName = apiConfig.activeProfile;
    const profile = apiConfig.profiles[activeProfileName];
    
    if (!profile) {
      throw new Error(`Active API profile '${activeProfileName}' not found`);
    }
    
    return profile;
  }

  // Switch API profile
  static async switchApiProfile(profileName: string): Promise<void> {
    const apiConfig = await this.getConfig('apiConfiguration');
    
    if (!apiConfig.profiles[profileName]) {
      throw new Error(`API profile '${profileName}' not found`);
    }
    
    await this.updateConfig('apiConfiguration', {
      activeProfile: profileName
    });
  }

  // Validate configuration
  static async validateConfiguration(): Promise<ConfigurationValidation> {
    const config = await this.loadConfiguration();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate API configuration
      const apiConfig = config.apiConfiguration;
      if (!apiConfig.profiles[apiConfig.activeProfile]) {
        errors.push('Active API profile not found');
      }

      // Validate business units
      const businessUnits = config.businessConfiguration.businessUnits;
      if (businessUnits.length === 0) {
        errors.push('No business units configured');
      }

      const enabledUnits = businessUnits.filter(bu => bu.enabled);
      if (enabledUnits.length === 0) {
        errors.push('No enabled business units found');
      }

      // Validate form configurations
      const inputConfig = config.userInputConfiguration;
      if (!inputConfig.manualOrderForm?.fields?.length) {
        warnings.push('Manual order form has no fields configured');
      }

      // Validate dashboard configuration
      const dashboardConfig = config.dashboardConfiguration;
      const enabledKPIs = dashboardConfig.kpiCards.filter(card => card.enabled);
      if (enabledKPIs.length === 0) {
        warnings.push('No KPI cards are enabled');
      }

      // Check for missing field mappings in active API profile
      const activeProfile = apiConfig.profiles[apiConfig.activeProfile];
      if (activeProfile && !activeProfile.fieldMappings?.salesData) {
        errors.push('Active API profile missing sales data field mappings');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Configuration validation failed: ${error.message}`]
      };
    }
  }

  // Export configuration for backup
  static async exportConfiguration(): Promise<string> {
    const config = await this.loadConfiguration();
    const exportData = {
      ...config,
      exportedAt: new Date().toISOString(),
      exportedBy: 'ConfigurationService'
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Import configuration from backup
  static async importConfiguration(jsonString: string): Promise<void> {
    try {
      const importedConfig = JSON.parse(jsonString);
      
      // Remove export metadata
      delete importedConfig.exportedAt;
      delete importedConfig.exportedBy;

      // Validate imported config
      const validation = await this.validateImportedConfig(importedConfig);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      // Apply imported configuration
      this.config = importedConfig;
      this.saveUserOverrides();
      this.notifyListeners();

      console.log('Configuration imported successfully');

    } catch (error) {
      throw new Error(`Failed to import configuration: ${error.message}`);
    }
  }

  // Reset to default configuration
  static async resetConfiguration(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    this.config = null;
    await this.loadConfiguration();
    console.log('Configuration reset to defaults');
  }

  // Add configuration change listener
  static addListener(callback: (config: AppConfiguration) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Private methods
  private static getUserOverrides(): UserOverrides {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load user configuration overrides:', error);
      return {};
    }
  }

  private static saveUserOverrides(): void {
    if (this.config) {
      try {
        // Save only the differences from base config
        const userChanges = this.extractUserChanges(this.config);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userChanges));
        console.log('User configuration overrides saved');
      } catch (error) {
        console.error('Failed to save user configuration overrides:', error);
      }
    }
  }

  private static mergeConfigurations(
    base: AppConfiguration, 
    overrides: UserOverrides
  ): AppConfiguration {
    const merged = { ...base };

    // Deep merge each section
    for (const [section, sectionOverrides] of Object.entries(overrides)) {
      if (merged[section as keyof AppConfiguration]) {
        merged[section as keyof AppConfiguration] = {
          ...merged[section as keyof AppConfiguration],
          ...sectionOverrides
        } as any;
      }
    }

    return merged;
  }

  private static extractUserChanges(config: AppConfiguration): UserOverrides {
    // In a real implementation, this would compare with the original base config
    // For now, we'll save the entire config as user overrides
    // This is a simplified approach
    return {
      apiConfiguration: config.apiConfiguration,
      dashboardConfiguration: config.dashboardConfiguration,
      userInterface: config.userInterface,
      businessConfiguration: config.businessConfiguration,
      userInputConfiguration: config.userInputConfiguration,
      systemConfiguration: config.systemConfiguration
    };
  }

  private static notifyListeners(): void {
    if (this.config) {
      this.listeners.forEach(callback => {
        try {
          callback(this.config!);
        } catch (error) {
          console.error('Configuration listener error:', error);
        }
      });
    }
  }

  private static async validateImportedConfig(config: any): Promise<ConfigurationValidation> {
    const errors: string[] = [];

    // Check required structure
    if (!config.version) errors.push('Missing version');
    if (!config.apiConfiguration) errors.push('Missing apiConfiguration');
    if (!config.dashboardConfiguration) errors.push('Missing dashboardConfiguration');
    if (!config.businessConfiguration) errors.push('Missing businessConfiguration');

    // Check API configuration structure
    if (config.apiConfiguration) {
      if (!config.apiConfiguration.profiles) {
        errors.push('Missing API profiles');
      } else if (Object.keys(config.apiConfiguration.profiles).length === 0) {
        errors.push('No API profiles defined');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static getDefaultConfiguration(): AppConfiguration {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      apiConfiguration: {
        profiles: {
          default: {
            name: 'Default API',
            description: 'Default configuration',
            baseUrl: '',
            timeout: 10000,
            retryAttempts: 3,
            healthCheckInterval: 300000,
            fieldMappings: {
              salesData: {
                totalSales: 'totalSales',
                totalGP: 'totalGP',
                totalOrders: 'totalOrders',
                averageMargin: 'averageMargin'
              }
            }
          }
        },
        activeProfile: 'default'
      },
      dashboardConfiguration: {
        defaultView: 'monthly',
        defaultBusinessUnit: 'all',
        refreshInterval: 300000,
        kpiCards: [],
        charts: {
          targetActual: { enabled: true, height: 300 },
          marginBands: { enabled: true, height: 300 },
          trendChart: { enabled: true, height: 400 }
        }
      },
      userInterface: {
        theme: {
          defaultMode: 'light',
          allowToggle: true,
          primaryColor: '207 90% 45%',
          secondaryColor: '207 30% 85%',
          accentColor: '0 75% 55%'
        },
        language: { default: 'th', supported: ['th', 'en'] },
        dateFormat: { display: 'DD/MM/YYYY', api: 'YYYY-MM-DD' },
        numberFormat: { currency: 'THB', locale: 'th-TH', decimals: 0, thousandSeparator: ',' },
        navigation: { showBreadcrumbs: false, enableBackButton: true, sidebarCollapsible: false }
      },
      businessConfiguration: {
        businessUnits: [
          { id: 'all', label: 'All Units', enabled: true, color: '#64748b' }
        ],
        targetSettings: {
          defaultInputMethod: 'monthly',
          defaultRolloverStrategy: 'none',
          allowBusinessUnitTargets: true,
          fiscalYearStart: '01-01'
        },
        validationRules: {}
      },
      userInputConfiguration: {
        manualOrderForm: { fields: [], layout: { columns: 1, sections: [] } },
        targetForm: { fields: [], layout: { columns: 1, sections: [] } }
      },
      systemConfiguration: {
        performance: {
          cacheTimeout: 300000,
          maxRetries: 3,
          requestTimeout: 10000,
          enableOfflineCache: true
        },
        logging: {
          level: 'info',
          enableConsole: true,
          enableAnalytics: false,
          logApiCalls: true
        },
        features: {
          realTimeUpdates: false,
          offlineMode: true,
          exportData: true,
          importData: true,
          autoSave: true,
          notifications: true
        },
        security: {
          sessionTimeout: 3600000,
          requireReauth: false,
          encryptLocalStorage: false
        }
      }
    };
  }
}