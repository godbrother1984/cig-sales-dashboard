
export interface ApiConfiguration {
  baseUrl: string;
  apiKey?: string;
  isEnabled: boolean;
}

const DEFAULT_CONFIG: ApiConfiguration = {
  baseUrl: 'https://cflowdev.cigblusolutions.com/api/service/cigSalesDashboard',
  apiKey: '',
  isEnabled: true
};

export class ApiConfigService {
  private static STORAGE_KEY = 'dynamics_api_config';

  static getConfig(): ApiConfiguration {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (error) {
      console.error('Error loading API config:', error);
    }
    return DEFAULT_CONFIG;
  }

  static saveConfig(config: ApiConfiguration): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      console.log('API configuration saved');
    } catch (error) {
      console.error('Error saving API config:', error);
    }
  }

  static resetConfig(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
