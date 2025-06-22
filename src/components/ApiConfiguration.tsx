
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { ApiConfigService, ApiConfiguration } from '../services/apiConfigService';
import { DynamicsApiService } from '../services/dynamicsApiService';

export const ApiConfiguration = () => {
  const [config, setConfig] = useState<ApiConfiguration>(ApiConfigService.getConfig());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setConfig(ApiConfigService.getConfig());
  }, []);

  const handleSave = () => {
    ApiConfigService.saveConfig(config);
    setTestMessage('Configuration saved successfully');
    setConnectionStatus('unknown');
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('unknown');
    setTestMessage('Testing connection...');

    try {
      const apiService = new DynamicsApiService({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey
      });

      const success = await apiService.testConnection();
      
      if (success) {
        setConnectionStatus('success');
        setTestMessage('Connection successful! API is responding.');
      } else {
        setConnectionStatus('error');
        setTestMessage('Connection failed. Please check your configuration.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setTestMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          MS Dynamics API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="api-enabled">Enable API Integration</Label>
          <Switch
            id="api-enabled"
            checked={config.isEnabled}
            onCheckedChange={(checked) => setConfig({ ...config, isEnabled: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="base-url">API Base URL</Label>
          <Input
            id="base-url"
            value={config.baseUrl}
            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
            placeholder="https://your-api-endpoint.com"
            disabled={!config.isEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key (Optional)</Label>
          <Input
            id="api-key"
            type="password"
            value={config.apiKey || ''}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            placeholder="Enter your API key if required"
            disabled={!config.isEnabled}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!config.isEnabled}>
            Save Configuration
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={!config.isEnabled || isTestingConnection}
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {testMessage && (
          <div className={`flex items-center gap-2 p-3 rounded-md ${
            connectionStatus === 'success' ? 'bg-green-50 text-green-700' :
            connectionStatus === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {connectionStatus === 'success' && <CheckCircle className="h-4 w-4" />}
            {connectionStatus === 'error' && <AlertCircle className="h-4 w-4" />}
            <span className="text-sm">{testMessage}</span>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Current endpoint: {config.baseUrl}?year=2025</p>
          <p>When disabled, the dashboard will use sample data for demonstration.</p>
        </div>
      </CardContent>
    </Card>
  );
};
