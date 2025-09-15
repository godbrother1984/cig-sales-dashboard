import React from 'react';
import { Button } from './ui/button';
import { Settings, Plus, Cog, LogOut, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { hasPermission } from '../utils/permissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const DashboardHeader = () => {
  const { user, logout } = useAuth();
  return <div className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img alt="CiG BluSolutions Logo" src="/lovable-uploads/d0097b84-8a8b-4286-8394-0bf1881e2648.png" className="h-12 w-auto object-fill" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales Performance Dashboard</h1>
              <p className="text-foreground/70">Real-time tracking from MS Dynamics 365</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-foreground/70">Last updated</p>
              <p className="text-sm font-medium text-foreground">{new Date().toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Role-based Navigation */}
              <div className="flex items-center gap-2">
                {hasPermission(user?.role, 'VIEW_TARGETS') && (
                  <Link to="/targets">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Targets
                    </Button>
                  </Link>
                )}

                {hasPermission(user?.role, 'VIEW_MANUAL_ENTRY') && (
                  <Link to="/manual-entry">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Manual Entry
                    </Button>
                  </Link>
                )}

                {hasPermission(user?.role, 'VIEW_SETTINGS') && (
                  <Link to="/settings">
                    <Button variant="outline" size="sm">
                      <Cog className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                )}
              </div>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto p-2 hover:bg-primary/10 hover:text-primary transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary capitalize">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>;
};