
/**
 * File: src/pages/Login.tsx
 * Version: 3.0.0
 * Date: 2025-09-14
 * Time: 23:55
 * Description: Keycloak Authentication Login Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, Key, Settings } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { Link } from 'react-router-dom';

const Login = () => {
  const { signIn, signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const [keycloakConfigured, setKeycloakConfigured] = useState(false);

  // Check if Keycloak is configured
  useEffect(() => {
    const keycloakConfig = localStorage.getItem('keycloak_config');
    if (keycloakConfig) {
      try {
        const config = JSON.parse(keycloakConfig);
        setKeycloakConfigured(
          config.isEnabled &&
          config.serverUrl &&
          config.realm &&
          config.clientId
        );
      } catch (error) {
        setKeycloakConfigured(false);
      }
    }
  }, []);

  const handleKeycloakLogin = async () => {
    try {
      await signIn();
      navigate('/');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleKeycloakSignup = async () => {
    try {
      await signUp('', '', '', 'viewer'); // Keycloak handles registration
    } catch (error) {
      // Error is handled in the hook
    }
  };

  // Development mode - Create temporary admin user
  const handleDevelopmentAdmin = () => {
    // Create fake user for development
    const devUser = {
      id: 'dev-admin-001',
      email: 'admin@dev.local',
      name: 'Development Admin',
      role: 'admin' as const,
      organization_id: 'dev-org',
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Temporarily store in localStorage for development
    localStorage.setItem('dev_user', JSON.stringify(devUser));
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-lg">กำลังโหลด...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Key className="h-6 w-6" />
              แดชบอร์ดการขาย
            </CardTitle>
            <p className="text-muted-foreground">เข้าสู่ระบบผ่าน Keycloak</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!keycloakConfigured ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Keycloak ยังไม่ได้ถูกตั้งค่า กรุณาตั้งค่า Keycloak ใน Settings ก่อนเข้าสู่ระบบ
                    <div className="mt-2">
                      <Link to="/settings">
                        <Button variant="outline" size="sm" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          ไปที่ Settings
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Development Mode - Always show when Keycloak not configured */}
                <div className="border-t pt-4">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">Development Mode</p>
                    <Button
                      onClick={handleDevelopmentAdmin}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      🚀 Login as Admin (Dev)
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      สำหรับการพัฒนาระบบ - ไม่ต้องตั้งค่า Keycloak
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">เข้าสู่ระบบด้วย Keycloak</h3>
                  <p className="text-sm text-muted-foreground">
                    คลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบผ่าน Keycloak server
                  </p>
                </div>

                <Button
                  onClick={handleKeycloakLogin}
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  <Key className="h-5 w-5 mr-2" />
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Keycloak'}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    ยังไม่มีบัญชีผู้ใช้?
                  </p>
                  <Button
                    onClick={handleKeycloakSignup}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    สมัครสมาชิกใหม่
                  </Button>
                </div>

                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>หมายเหตุ:</strong><br/>
                    • การเข้าสู่ระบบและสมัครสมาชิกจะดำเนินการผ่าน Keycloak server<br/>
                    • Role และสิทธิ์ต่างๆ จะถูกจัดการโดย Keycloak admin<br/>
                    • หากมีปัญหาการเข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ
                  </AlertDescription>
                </Alert>

                {/* Development Mode - Also show when Keycloak is configured */}
                <div className="border-t pt-4">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">Development Mode</p>
                    <Button
                      onClick={handleDevelopmentAdmin}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      🚀 Login as Admin (Dev)
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      สำหรับการพัฒนาระบบ - ไม่ต้องใช้ Keycloak
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
