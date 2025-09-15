/**
 * File: src/pages/Settings.tsx
 * Version: 2.0.0
 * Date: 2025-09-15
 * Time: 12:00
 * Description: Simplified settings page with consolidated API and authentication configuration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Settings as SettingsIcon, Globe, Key, Database, ArrowLeft, Building2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';

interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  apiKey?: string;
  isActive: boolean;
  iconType: 'database' | 'globe';
}

interface FieldMapping {
  id: string;
  displayName: string;
  description: string;
  apiKey: string;
  apiEndpoint: string;
  cardComponent: string;
  dataType: 'number' | 'string' | 'currency' | 'percentage';
  isRequired: boolean;
}

interface KeycloakConfig {
  serverUrl: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
  isEnabled: boolean;
}

const Settings = () => {
  const { toast } = useToast();

  // API Endpoints State
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'error'>>({});

  // Field Mapping State
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

  // Keycloak State
  const [keycloakConfig, setKeycloakConfig] = useState<KeycloakConfig>({
    serverUrl: '',
    realm: '',
    clientId: '',
    clientSecret: '',
    isEnabled: false
  });
  const [keycloakTestResult, setKeycloakTestResult] = useState<'testing' | 'success' | 'error' | null>(null);

  // Master Data State
  const [companiesText, setCompaniesText] = useState('CIG Group, CIG BluSolutions, CIG Engineering, CIG Trading, CIG Services');
  const [apiParams, setApiParams] = useState({
    company: 'company',
    year: 'year',
    month: 'month'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load API endpoints
    const savedEndpoints = localStorage.getItem('api_endpoints');
    if (savedEndpoints) {
      try {
        setEndpoints(JSON.parse(savedEndpoints));
      } catch (error) {
        console.error('Error loading API endpoints:', error);
      }
    } else {
      // Initialize default endpoints
      const defaultEndpoints: ApiEndpoint[] = [
        {
          id: 'dynamics_api',
          name: 'MS Dynamics API',
          description: 'Microsoft Dynamics 365 Sales API',
          baseUrl: '',
          apiKey: '',
          isActive: false,
          iconType: 'database'
        },
        {
          id: 'legacy_api',
          name: 'Legacy Sales API',
          description: 'Legacy sales data API',
          baseUrl: 'https://cflowdev.cigblusolutions.com/api',
          apiKey: '',
          isActive: true,
          iconType: 'globe'
        }
      ];
      setEndpoints(defaultEndpoints);
      localStorage.setItem('api_endpoints', JSON.stringify(defaultEndpoints));
    }

    // Load Keycloak config
    const savedKeycloak = localStorage.getItem('keycloak_config');
    if (savedKeycloak) {
      try {
        setKeycloakConfig(JSON.parse(savedKeycloak));
      } catch (error) {
        console.error('Error loading Keycloak config:', error);
      }
    }

    // Load companies text
    const savedCompaniesText = localStorage.getItem('companies_text');
    if (savedCompaniesText) {
      setCompaniesText(savedCompaniesText);
    }

    // Load field mappings
    const savedMappings = localStorage.getItem('field_mappings');
    if (savedMappings) {
      try {
        setFieldMappings(JSON.parse(savedMappings));
      } catch (error) {
        console.error('Error loading field mappings:', error);
      }
    } else {
      // Initialize default field mappings
      const defaultMappings: FieldMapping[] = [
        {
          id: 'total_sales',
          displayName: 'ยอดขายทั้งหมด',
          description: 'ยอดขายรวมทั้งหมดสำหรับ KPI Summary Card',
          apiKey: 'totalSales',
          apiEndpoint: 'dynamics_api',
          cardComponent: 'KPISummary',
          dataType: 'currency',
          isRequired: true
        },
        {
          id: 'total_gp',
          displayName: 'กำไรขั้นต้นทั้งหมด',
          description: 'กำไรขั้นต้นรวมทั้งหมดสำหรับ KPI Summary Card',
          apiKey: 'totalGP',
          apiEndpoint: 'dynamics_api',
          cardComponent: 'KPISummary',
          dataType: 'currency',
          isRequired: true
        },
        {
          id: 'customer_name',
          displayName: 'ชื่อลูกค้า',
          description: 'ชื่อลูกค้าสำหรับการกรองและแสดงผล',
          apiKey: 'customerName',
          apiEndpoint: 'dynamics_api',
          cardComponent: 'Filters',
          dataType: 'string',
          isRequired: false
        }
      ];
      setFieldMappings(defaultMappings);
      localStorage.setItem('field_mappings', JSON.stringify(defaultMappings));
    }
  };

  const updateEndpoint = (id: string, updates: Partial<ApiEndpoint>) => {
    const updatedEndpoints = endpoints.map(endpoint =>
      endpoint.id === id ? { ...endpoint, ...updates } : endpoint
    );
    setEndpoints(updatedEndpoints);
    localStorage.setItem('api_endpoints', JSON.stringify(updatedEndpoints));
  };

  const updateFieldMapping = (id: string, updates: Partial<FieldMapping>) => {
    const updatedMappings = fieldMappings.map(mapping =>
      mapping.id === id ? { ...mapping, ...updates } : mapping
    );
    setFieldMappings(updatedMappings);
    localStorage.setItem('field_mappings', JSON.stringify(updatedMappings));
  };

  const addFieldMapping = () => {
    const newMapping: FieldMapping = {
      id: `custom_${Date.now()}`,
      displayName: 'ฟิลด์ใหม่',
      description: 'คำอธิบายฟิลด์ใหม่',
      apiKey: '',
      apiEndpoint: 'dynamics_api',
      cardComponent: 'KPISummary',
      dataType: 'string',
      isRequired: false
    };
    const updatedMappings = [...fieldMappings, newMapping];
    setFieldMappings(updatedMappings);
    localStorage.setItem('field_mappings', JSON.stringify(updatedMappings));
  };

  const deleteFieldMapping = (id: string) => {
    const updatedMappings = fieldMappings.filter(mapping => mapping.id !== id);
    setFieldMappings(updatedMappings);
    localStorage.setItem('field_mappings', JSON.stringify(updatedMappings));
  };

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    setTestResults(prev => ({ ...prev, [endpoint.id]: 'testing' }));

    try {
      const response = await fetch(`${endpoint.baseUrl}/health`, {
        method: 'GET',
        headers: endpoint.apiKey ? { 'Authorization': `Bearer ${endpoint.apiKey}` } : {}
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, [endpoint.id]: 'success' }));
        toast({
          title: "API Test สำเร็จ",
          description: `${endpoint.name} เชื่อมต่อได้ปกติ`,
          variant: "default",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [endpoint.id]: 'error' }));
      toast({
        title: "API Test ล้มเหลว",
        description: `${endpoint.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const testKeycloak = async () => {
    setKeycloakTestResult('testing');

    try {
      const response = await fetch(`${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}`, {
        method: 'GET'
      });

      if (response.ok) {
        setKeycloakTestResult('success');
        toast({
          title: "Keycloak Test สำเร็จ",
          description: "เชื่อมต่อ Keycloak ได้ปกติ",
          variant: "default",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setKeycloakTestResult('error');
      toast({
        title: "Keycloak Test ล้มเหลว",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const saveKeycloak = () => {
    localStorage.setItem('keycloak_config', JSON.stringify(keycloakConfig));
    toast({
      title: "บันทึก Keycloak Config สำเร็จ",
      description: "การตั้งค่า Keycloak ได้รับการบันทึกแล้ว",
      variant: "default",
    });
  };

  const exportSettings = () => {
    const settings = {
      api_endpoints: endpoints,
      field_mappings: fieldMappings,
      keycloak_config: keycloakConfig,
      master_data: {
        companiesText,
        apiParams
      }
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export สำเร็จ",
      description: "การตั้งค่าถูก export แล้ว",
      variant: "default",
    });
  };

  const resetSettings = () => {
    if (confirm('คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดใช่หรือไม่?')) {
      localStorage.removeItem('api_endpoints');
      localStorage.removeItem('field_mappings');
      localStorage.removeItem('keycloak_config');
      localStorage.removeItem('companies_text');

      loadSettings();

      toast({
        title: "รีเซ็ตสำเร็จ",
        description: "การตั้งค่าทั้งหมดถูกรีเซ็ตแล้ว",
        variant: "default",
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6">
        <Key className="h-4 w-4" />
        <AlertTitle>ข้อมูลการตั้งค่า</AlertTitle>
        <AlertDescription>
          การตั้งค่าทั้งหมดจะถูกเก็บใน localStorage ของ browser
          ข้อมูลจะไม่หายไปเมื่อรีเฟรชหน้า แต่จะหายหากลบข้อมูล browser
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api">API & Data</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* API & Data Configuration */}
        <TabsContent value="api" className="space-y-6">
          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {endpoint.iconType === 'database' ? (
                          <Database className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Globe className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                          <CardTitle className="text-base">{endpoint.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testEndpoint(endpoint)}
                          disabled={!endpoint.baseUrl || testResults[endpoint.id] === 'testing'}
                        >
                          {testResults[endpoint.id] === 'testing' ? 'กำลังทดสอบ...' : 'ทดสอบ API'}
                        </Button>
                        {testResults[endpoint.id] === 'success' && (
                          <Badge variant="default" className="bg-green-500">เชื่อมต่อได้</Badge>
                        )}
                        {testResults[endpoint.id] === 'error' && (
                          <Badge variant="destructive">เชื่อมต่อไม่ได้</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base URL</Label>
                        <Input
                          value={endpoint.baseUrl}
                          onChange={(e) => updateEndpoint(endpoint.id, { baseUrl: e.target.value })}
                          placeholder="https://api.example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>API Key (ไม่บังคับ)</Label>
                        <Input
                          type="password"
                          value={endpoint.apiKey || ''}
                          onChange={(e) => updateEndpoint(endpoint.id, { apiKey: e.target.value })}
                          placeholder="API Key หรือ Token"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={endpoint.isActive}
                        onChange={(e) => updateEndpoint(endpoint.id, { isActive: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label>เปิดใช้งาน API นี้</Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Master Data Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Master Data Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Companies */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">รายชื่อบริษัท (คั่นด้วย comma)</Label>
                    <textarea
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-20"
                      value={companiesText}
                      onChange={(e) => {
                        setCompaniesText(e.target.value);
                        localStorage.setItem('companies_text', e.target.value);
                      }}
                      placeholder="CIG Group, CIG BluSolutions, CIG Engineering"
                    />
                    <p className="text-xs text-muted-foreground">
                      ระบบจะเรียก API สำหรับทุกบริษัทในรายการ
                    </p>
                  </div>
                </div>

                {/* API Parameters */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">API Parameter Names</Label>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Company Parameter</Label>
                      <Input
                        value={apiParams.company}
                        onChange={(e) => setApiParams(prev => ({ ...prev, company: e.target.value }))}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Year Parameter</Label>
                      <Input
                        value={apiParams.year}
                        onChange={(e) => setApiParams(prev => ({ ...prev, year: e.target.value }))}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Month Parameter</Label>
                      <Input
                        value={apiParams.month}
                        onChange={(e) => setApiParams(prev => ({ ...prev, month: e.target.value }))}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <Label className="text-xs font-medium">ตัวอย่าง URL:</Label>
                    <div className="mt-1 p-2 bg-muted rounded text-xs font-mono">
                      ?{apiParams.company}=CIG%20Group&{apiParams.year}=2025&{apiParams.month}=3
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Mapping Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Field Mapping Configuration
                </CardTitle>
                <Button onClick={addFieldMapping} variant="outline" size="sm">
                  + เพิ่มฟิลด์ใหม่
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertTitle>วิธีการใช้งาน</AlertTitle>
                <AlertDescription>
                  กำหนดการแมประหว่าง key ที่ได้รับจาก API กับฟิลด์ที่ต้องการแสดงผลในการ์ดต่างๆ
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {fieldMappings.map((mapping) => (
                  <Card key={mapping.id} className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-base">{mapping.displayName}</CardTitle>
                          {mapping.isRequired && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">จำเป็น</span>
                          )}
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {mapping.cardComponent}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {mapping.dataType}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFieldMapping(mapping.id)}
                          disabled={mapping.isRequired}
                          className="text-red-600 hover:text-red-800"
                        >
                          ลบ
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{mapping.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>ชื่อแสดงผล</Label>
                          <Input
                            value={mapping.displayName}
                            onChange={(e) => updateFieldMapping(mapping.id, { displayName: e.target.value })}
                            placeholder="ชื่อที่แสดงในการ์ด"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input
                            value={mapping.apiKey}
                            onChange={(e) => updateFieldMapping(mapping.id, { apiKey: e.target.value })}
                            placeholder="key ที่ได้จาก API response"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>API Endpoint</Label>
                          <select
                            value={mapping.apiEndpoint}
                            onChange={(e) => updateFieldMapping(mapping.id, { apiEndpoint: e.target.value })}
                            className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md"
                          >
                            {endpoints.map((endpoint) => (
                              <option key={endpoint.id} value={endpoint.id}>
                                {endpoint.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>การ์ด Component</Label>
                          <select
                            value={mapping.cardComponent}
                            onChange={(e) => updateFieldMapping(mapping.id, { cardComponent: e.target.value })}
                            className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md"
                          >
                            <option value="KPISummary">KPI Summary Card</option>
                            <option value="ActionItems">Action Items Card</option>
                            <option value="Charts">Charts</option>
                            <option value="Filters">Filters</option>
                            <option value="Tables">Tables</option>
                            <option value="Other">อื่นๆ</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data Type</Label>
                          <select
                            value={mapping.dataType}
                            onChange={(e) => updateFieldMapping(mapping.id, { dataType: e.target.value as any })}
                            className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md"
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="currency">Currency</option>
                            <option value="percentage">Percentage</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>คำอธิบาย</Label>
                          <Input
                            value={mapping.description}
                            onChange={(e) => updateFieldMapping(mapping.id, { description: e.target.value })}
                            placeholder="คำอธิบายการใช้งาน"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Configuration */}
        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Keycloak Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Server URL</Label>
                  <Input
                    value={keycloakConfig.serverUrl}
                    onChange={(e) => setKeycloakConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                    placeholder="https://keycloak.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Realm</Label>
                  <Input
                    value={keycloakConfig.realm}
                    onChange={(e) => setKeycloakConfig(prev => ({ ...prev, realm: e.target.value }))}
                    placeholder="my-realm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    value={keycloakConfig.clientId}
                    onChange={(e) => setKeycloakConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="my-client"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret (ไม่บังคับ)</Label>
                  <Input
                    type="password"
                    value={keycloakConfig.clientSecret || ''}
                    onChange={(e) => setKeycloakConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="client-secret"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={keycloakConfig.isEnabled}
                  onChange={(e) => setKeycloakConfig(prev => ({ ...prev, isEnabled: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label>เปิดใช้งาน Keycloak</Label>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={testKeycloak} variant="outline">
                  {keycloakTestResult === 'testing' ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
                </Button>
                <Button onClick={saveKeycloak}>บันทึกการตั้งค่า</Button>

                {keycloakTestResult === 'success' && (
                  <Badge variant="default" className="bg-green-500">เชื่อมต่อได้</Badge>
                )}
                {keycloakTestResult === 'error' && (
                  <Badge variant="destructive">เชื่อมต่อไม่ได้</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Management */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการการตั้งค่า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={exportSettings} variant="outline">
                  Export การตั้งค่า
                </Button>
                <Button onClick={resetSettings} variant="destructive">
                  รีเซ็ตการตั้งค่าทั้งหมด
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Export: ดาวน์โหลดไฟล์การตั้งค่าเพื่อใช้สำรองข้อมูล<br/>
                Reset: ลบการตั้งค่าทั้งหมดและกลับไปใช้ค่าเริ่มต้น
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;