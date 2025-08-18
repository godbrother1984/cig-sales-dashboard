import { BaseApiService, ApiResponse } from './baseApiService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'tester';
  organization_id?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'editor' | 'tester';
  organization_id?: string;
}

export class UserApiService extends BaseApiService {
  // Keep the login method for future use when authentication is implemented
  async login(credentials: LoginCredentials): Promise<ApiResponse<User & { token?: string }>> {
    return this.request('/SalesdashboardUser/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    return this.request('/SalesdashboardUser/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getAllUsers(): Promise<ApiResponse<User>> {
    return this.request('/SalesdashboardUser/users');
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request(`/SalesdashboardUser/users/${id}`);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/SalesdashboardUser/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<User>> {
    return this.request(`/SalesdashboardUser/users/${id}`, {
      method: 'DELETE'
    });
  }
}
