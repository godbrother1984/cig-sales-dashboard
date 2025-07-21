
export interface ApiResponse<T> {
  result: boolean;
  data?: T;
  datas?: T[];
  errors?: Array<{
    path: string;
    code: string;
    message: string;
  }>;
  canChange?: boolean;
}

export class BaseApiService {
  protected baseUrl: string;
  protected getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  constructor(baseUrl: string = 'https://cflowdev.cigblusolutions.com/api') {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}
