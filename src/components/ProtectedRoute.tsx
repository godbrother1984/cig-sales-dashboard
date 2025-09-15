/**
 * File: src/components/ProtectedRoute.tsx
 * Version: 1.0.0
 * Date: 2025-09-14
 * Time: 23:42
 * Description: Protected route component for role-based access control
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { hasAnyPermission, Permission } from '../utils/permissions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  fallbackPath?: string;
  showUnauthorizedPage?: boolean;
}

const UnauthorizedPage: React.FC<{ requiredPermissions: Permission[] }> = ({ requiredPermissions }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">ไม่มีสิทธิ์เข้าถึง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์
          </p>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <strong>สิทธิ์ที่ต้องการ:</strong>
            <ul className="mt-2 text-left">
              {requiredPermissions.map(permission => (
                <li key={permission} className="list-disc list-inside">
                  {getPermissionDisplayName(permission)}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 justify-center">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับสู่หน้าแรก
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get Thai display names for permissions
const getPermissionDisplayName = (permission: Permission): string => {
  const displayNames: Record<Permission, string> = {
    VIEW_DASHBOARD: 'ดูหน้า Dashboard',
    VIEW_SETTINGS: 'เข้าถึงการตั้งค่า',
    VIEW_TARGETS: 'ดูหน้าเป้าหมาย',
    VIEW_MANUAL_ENTRY: 'เข้าถึงการบันทึกข้อมูลด้วยตนเอง',
    VIEW_LOGIN: 'เข้าสู่ระบบ',
    EDIT_TARGETS: 'แก้ไขเป้าหมาย',
    ADD_MANUAL_ORDERS: 'เพิ่มรายการสั่งซื้อ',
    DELETE_MANUAL_ORDERS: 'ลบรายการสั่งซื้อ',
    EXPORT_DATA: 'ส่งออกข้อมูล',
    MANAGE_APIS: 'จัดการ API',
    MANAGE_USERS: 'จัดการผู้ใช้',
    VIEW_SYSTEM_LOGS: 'ดูบันทึกระบบ'
  };

  return displayNames[permission] || permission;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions,
  fallbackPath = '/login',
  showUnauthorizedPage = true
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required permissions
  const hasRequiredPermission = hasAnyPermission(user.role, requiredPermissions);

  if (!hasRequiredPermission) {
    if (showUnauthorizedPage) {
      return <UnauthorizedPage requiredPermissions={requiredPermissions} />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // User has permission, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;