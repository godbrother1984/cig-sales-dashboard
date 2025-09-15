
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { FieldMappingProvider } from "./contexts/FieldMappingContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Targets from "./pages/Targets";
import ManualEntry from "./pages/ManualEntry";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Allow access to login page always (for development and Keycloak setup)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Allow access to Settings without authentication for Keycloak configuration */}
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <ProtectedRoute requiredPermissions={['VIEW_SETTINGS']}>
              <Settings />
            </ProtectedRoute>
          ) : (
            <Settings />
          )
        }
      />

      {/* Dashboard - accessible by all authenticated users */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredPermissions={['VIEW_DASHBOARD']}>
            <Index />
          </ProtectedRoute>
        }
      />

      {/* Targets - only admin and sales */}
      <Route
        path="/targets"
        element={
          <ProtectedRoute requiredPermissions={['VIEW_TARGETS']}>
            <Targets />
          </ProtectedRoute>
        }
      />

      {/* Manual Entry - only admin and sales */}
      <Route
        path="/manual-entry"
        element={
          <ProtectedRoute requiredPermissions={['VIEW_MANUAL_ENTRY']}>
            <ManualEntry />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <FieldMappingProvider>
            <AppRoutes />
          </FieldMappingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
