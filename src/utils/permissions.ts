/**
 * File: src/utils/permissions.ts
 * Version: 1.0.0
 * Date: 2025-09-14
 * Time: 23:40
 * Description: Role-based permission system for application access control
 */

export type UserRole = 'admin' | 'sales' | 'editor' | 'tester' | 'viewer';

export type Permission =
  // Page Access
  | 'VIEW_DASHBOARD'
  | 'VIEW_SETTINGS'
  | 'VIEW_TARGETS'
  | 'VIEW_MANUAL_ENTRY'
  | 'VIEW_LOGIN'

  // Data Operations
  | 'EDIT_TARGETS'
  | 'ADD_MANUAL_ORDERS'
  | 'DELETE_MANUAL_ORDERS'
  | 'EXPORT_DATA'

  // System Management
  | 'MANAGE_APIS'
  | 'MANAGE_USERS'
  | 'VIEW_SYSTEM_LOGS';

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    'VIEW_DASHBOARD',
    'VIEW_SETTINGS',
    'VIEW_TARGETS',
    'VIEW_MANUAL_ENTRY',
    'VIEW_LOGIN',
    'EDIT_TARGETS',
    'ADD_MANUAL_ORDERS',
    'DELETE_MANUAL_ORDERS',
    'EXPORT_DATA',
    'MANAGE_APIS',
    'MANAGE_USERS',
    'VIEW_SYSTEM_LOGS'
  ],

  sales: [
    // Sales team access
    'VIEW_DASHBOARD',
    'VIEW_TARGETS',
    'VIEW_MANUAL_ENTRY',
    'VIEW_LOGIN',
    'EDIT_TARGETS',
    'ADD_MANUAL_ORDERS',
    'DELETE_MANUAL_ORDERS'  // Sales can delete their own entries
  ],

  editor: [
    // Data editor access
    'VIEW_DASHBOARD',
    'VIEW_LOGIN',
    'EXPORT_DATA'
  ],

  tester: [
    // Testing access
    'VIEW_DASHBOARD',
    'VIEW_TARGETS',
    'VIEW_MANUAL_ENTRY',
    'VIEW_LOGIN'
  ],

  viewer: [
    // Read-only access
    'VIEW_DASHBOARD',
    'VIEW_LOGIN'
  ]
};

/**
 * Check if a user role has a specific permission
 */
export const hasPermission = (userRole: UserRole | null | undefined, permission: Permission): boolean => {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

/**
 * Check if a user role has any of the specified permissions
 */
export const hasAnyPermission = (userRole: UserRole | null | undefined, permissions: Permission[]): boolean => {
  if (!userRole) return false;
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if a user role has all of the specified permissions
 */
export const hasAllPermissions = (userRole: UserRole | null | undefined, permissions: Permission[]): boolean => {
  if (!userRole) return false;
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a user role
 */
export const getUserPermissions = (userRole: UserRole | null | undefined): Permission[] => {
  if (!userRole) return [];
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Map Keycloak roles to application roles
 * This function handles the mapping from Keycloak JWT token roles to our app roles
 */
export const mapKeycloakRoleToAppRole = (keycloakRoles: string[] = []): UserRole => {
  // Priority mapping - admin has highest priority
  if (keycloakRoles.includes('admin') || keycloakRoles.includes('administrator')) {
    return 'admin';
  }

  if (keycloakRoles.includes('sales') || keycloakRoles.includes('salesperson')) {
    return 'sales';
  }

  if (keycloakRoles.includes('editor') || keycloakRoles.includes('data-editor')) {
    return 'editor';
  }

  if (keycloakRoles.includes('tester') || keycloakRoles.includes('qa')) {
    return 'tester';
  }

  // Default fallback
  return 'viewer';
};

/**
 * Route path to permission mapping
 * Used for route-level protection
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/': ['VIEW_DASHBOARD'],
  '/dashboard': ['VIEW_DASHBOARD'],
  '/settings': ['VIEW_SETTINGS'],
  '/targets': ['VIEW_TARGETS'],
  '/manual-entry': ['VIEW_MANUAL_ENTRY'],
  '/login': ['VIEW_LOGIN']
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (userRole: UserRole | null | undefined, routePath: string): boolean => {
  const requiredPermissions = ROUTE_PERMISSIONS[routePath];
  if (!requiredPermissions) return true; // Public route

  return hasAnyPermission(userRole, requiredPermissions);
};