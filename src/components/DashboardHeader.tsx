
import React from 'react';
import { Button } from './ui/button';
import { Settings, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardHeader = () => {
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/87fa2ce9-4efe-496b-8ad4-26e97592b6e0.png" 
              alt="CiG BluSolutions Logo" 
              className="h-12 w-auto"
            />
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
            <div className="flex gap-2">
              <Link to="/targets">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Targets
                </Button>
              </Link>
              <Link to="/manual-entry">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
