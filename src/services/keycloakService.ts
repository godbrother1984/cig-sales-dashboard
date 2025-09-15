/**
 * File: src/services/keycloakService.ts
 * Version: 1.0.0
 * Date: 2025-09-14
 * Time: 23:50
 * Description: Keycloak authentication service
 */

import Keycloak from 'keycloak-js';
import { mapKeycloakRoleToAppRole } from '../utils/permissions';
import { User } from '../types';

export class KeycloakService {
  private keycloak: Keycloak | null = null;
  private initialized = false;

  /**
   * Initialize Keycloak with configuration from localStorage
   */
  async initialize(): Promise<boolean> {
    try {
      // Load Keycloak configuration from localStorage (Settings page)
      const keycloakConfigStr = localStorage.getItem('keycloak_config');
      if (!keycloakConfigStr) {
        console.warn('No Keycloak configuration found in localStorage');
        return false;
      }

      const keycloakConfig = JSON.parse(keycloakConfigStr);

      if (!keycloakConfig.isEnabled || !keycloakConfig.serverUrl || !keycloakConfig.realm || !keycloakConfig.clientId) {
        console.warn('Keycloak configuration incomplete or disabled');
        return false;
      }

      // Initialize Keycloak instance
      this.keycloak = new Keycloak({
        url: keycloakConfig.serverUrl,
        realm: keycloakConfig.realm,
        clientId: keycloakConfig.clientId,
      });

      // Initialize authentication
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false, // Disable iframe for better compatibility
        flow: 'standard',
      });

      this.initialized = true;
      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      return false;
    }
  }

  /**
   * Check if Keycloak is initialized and user is authenticated
   */
  isAuthenticated(): boolean {
    return this.initialized && this.keycloak?.authenticated === true;
  }

  /**
   * Get current user information from Keycloak token
   */
  getCurrentUser(): User | null {
    if (!this.isAuthenticated() || !this.keycloak?.tokenParsed) {
      return null;
    }

    const token = this.keycloak.tokenParsed as any;

    // Extract roles from token (from realm_access or resource_access)
    const realmRoles = token.realm_access?.roles || [];
    const appRole = mapKeycloakRoleToAppRole(realmRoles);

    return {
      id: token.sub || token.preferred_username || 'unknown',
      email: token.email || token.preferred_username || '',
      name: token.name || token.preferred_username || 'Unknown User',
      role: appRole,
      organization_id: token.organization_id,
      last_login: new Date().toISOString(),
      created_at: token.iat ? new Date(token.iat * 1000).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Login to Keycloak
   */
  async login(): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak not initialized');
    }

    await this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  /**
   * Logout from Keycloak
   */
  async logout(): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak not initialized');
    }

    await this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  /**
   * Get access token
   */
  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  /**
   * Update token if needed
   */
  async updateToken(minValidity = 30): Promise<boolean> {
    if (!this.keycloak) {
      return false;
    }

    try {
      const refreshed = await this.keycloak.updateToken(minValidity);
      return refreshed;
    } catch (error) {
      console.error('Failed to update token:', error);
      return false;
    }
  }

  /**
   * Get user roles from token
   */
  getUserRoles(): string[] {
    if (!this.keycloak?.tokenParsed) {
      return [];
    }

    const token = this.keycloak.tokenParsed as any;
    return token.realm_access?.roles || [];
  }

  /**
   * Check if user has specific Keycloak role
   */
  hasKeycloakRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  /**
   * Get Keycloak instance (for advanced usage)
   */
  getKeycloakInstance(): Keycloak | null {
    return this.keycloak;
  }

  /**
   * Add token to HTTP requests automatically
   */
  addTokenToRequest = (config: any) => {
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  };
}

// Create singleton instance
export const keycloakService = new KeycloakService();