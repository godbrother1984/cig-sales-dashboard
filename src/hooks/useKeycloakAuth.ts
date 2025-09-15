/**
 * File: src/hooks/useKeycloakAuth.ts
 * Version: 1.0.0
 * Date: 2025-09-14
 * Time: 23:52
 * Description: Keycloak authentication hook
 */

import { useState, useEffect, useCallback } from 'react';
import { keycloakService } from '../services/keycloakService';
import { User } from '../types';
import { useToast } from './use-toast';

export const useKeycloakAuth = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize Keycloak
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        // Check for development user first
        const devUser = localStorage.getItem('dev_user');
        if (devUser) {
          const user = JSON.parse(devUser);
          setUser(user);
          setIsAuthenticated(true);
          setIsLoading(false);

          toast({
            title: "Development Mode",
            description: `Logged in as ${user.name} (Development)`,
            variant: "default",
          });
          return;
        }
        const authenticated = await keycloakService.initialize();

        if (authenticated) {
          const currentUser = keycloakService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);

          console.log('Keycloak authentication successful:', currentUser);

          // Show welcome message
          if (currentUser) {
            toast({
              title: "เข้าสู่ระบบสำเร็จ",
              description: `ยินดีต้อนรับ, ${currentUser.name}!`,
            });
          }
        } else {
          console.log('User not authenticated with Keycloak');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setUser(null);
        setIsAuthenticated(false);

        toast({
          title: "การเชื่อมต่อล้มเหลว",
          description: "ไม่สามารถเชื่อมต่อกับระบบ authentication ได้",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [toast]);

  // Login function
  const signIn = useCallback(async (email?: string, password?: string): Promise<void> => {
    // For Keycloak, email and password are handled by the Keycloak server
    // This function redirects to Keycloak login page
    try {
      setIsLoading(true);
      await keycloakService.login();
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "การเข้าสู่ระบบล้มเหลว",
        description: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Check if development mode
      const devUser = localStorage.getItem('dev_user');
      if (devUser) {
        localStorage.removeItem('dev_user');
        setUser(null);
        setIsAuthenticated(false);
        toast({
          title: "ออกจากระบบสำเร็จ",
          description: "ออกจาก Development Mode แล้ว",
        });
        return;
      }

      // Regular Keycloak logout
      await keycloakService.logout();

      // Clear local state
      setUser(null);
      setIsAuthenticated(false);

      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "การออกจากระบบล้มเหลว",
        description: "เกิดข้อผิดพลาดในการออกจากระบบ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Sign up function - redirect to Keycloak registration
  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    role?: 'admin' | 'sales' | 'editor' | 'tester' | 'viewer'
  ): Promise<void> => {
    // For Keycloak, user registration is typically handled by the Keycloak admin
    // or through Keycloak's registration flow
    toast({
      title: "สมัครสมาชิกผ่าน Keycloak",
      description: "กรุณาติดต่อผู้ดูแลระบบเพื่อสร้างบัญชีผู้ใช้",
      variant: "default",
    });

    // Optionally redirect to Keycloak registration page
    const keycloakConfig = JSON.parse(localStorage.getItem('keycloak_config') || '{}');
    if (keycloakConfig.serverUrl && keycloakConfig.realm) {
      const registrationUrl = `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/registrations?client_id=${keycloakConfig.clientId}&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin)}`;
      window.open(registrationUrl, '_blank');
    }
  }, [toast]);

  // Update token periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const tokenRefreshInterval = setInterval(async () => {
      const refreshed = await keycloakService.updateToken(30);
      if (refreshed) {
        console.log('Token refreshed successfully');
        // Update user info in case roles changed
        const updatedUser = keycloakService.getCurrentUser();
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(tokenRefreshInterval);
  }, [isAuthenticated]);

  // Get access token
  const getAccessToken = useCallback((): string | undefined => {
    return keycloakService.getToken();
  }, []);

  // Check if user has specific Keycloak role
  const hasKeycloakRole = useCallback((role: string): boolean => {
    return keycloakService.hasKeycloakRole(role);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    logout,
    getAccessToken,
    hasKeycloakRole,
  };
};