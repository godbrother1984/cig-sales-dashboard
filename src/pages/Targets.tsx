import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save, BarChart, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { MonthlyTargetsInput } from '../components/MonthlyTargetsInput';
import { AnnualTargetsInput } from '../components/AnnualTargetsInput';
import { EnhancedTargets } from '../types';
import { calculateMonthlyTargetsFromAnnual, calculateYTDTarget } from '../utils/targetCalculations';

const Targets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [targets, setTargets] = useState<EnhancedTargets>({
    inputMethod: 'monthly',
    rolloverStrategy: 'none',
    monthlyTargets: {
      sales: Array(12).fill(3200000),
      gp: Array(12).fill(800000)
    },
    annualTargets: {
      sales: 38400000,
      gp: 9600000,
      distribution: 'equal'
    }
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [previewTargets, setPreviewTargets] = useState<{ sales: number[]; gp: number[] } | null>(null);

  useEffect(() => {
    const savedTargets = localStorage.getItem('enhancedSalesTargets');
    if (savedTargets) {
      setTargets(JSON.parse(savedTargets));
    }
  }, []);

  const handleSalesTargetChange = (month: number, value: number) => {
    setTargets(prev => ({
      ...prev,
      monthlyTargets: {
        ...prev.monthlyTargets,
        sales: prev.monthlyTargets.sales.map((target, index) => 
          index === month ? value : target
        )
      }
    }));
  };

  const handleGPTargetChange = (month: number, value: number) => {
    setTargets(prev => ({
      ...prev,
      monthlyTargets: {
        ...prev.monthlyTargets,
        gp: prev.monthlyTargets.gp.map((target, index) => 
          index === month ? value : target
        )
      }
    }));
  };

  const handlePreviewMonthly = () => {
    const preview = calculateMonthlyTargetsFromAnnual(
      targets.annualTargets.sales,
      targets.annualTargets.gp,
      targets.annualTargets.distribution,
      targets.annualTargets.weights
    );
    setPreviewTargets(preview);
    setPreviewMode(true);
  };

  const handleApplyPreview = () => {
    if (previewTargets) {
      setTargets(prev => ({
        ...prev,
        monthlyTargets: previewTargets
      }));
      setPreviewMode(false);
      setPreviewTargets(null);
    }
  };

  const handleSave = () => {
    localStorage.setItem('enhancedSalesTargets', JSON.stringify(targets));
    
    // Also save in legacy format for compatibility
    const currentMonth = new Date().getMonth() + 1;
    const ytdTargets = calculateYTDTarget(targets, currentMonth);
    
    const legacyTargets = {
      monthlySales: targets.inputMethod === 'monthly' 
        ? targets.monthlyTargets.sales[currentMonth - 1] 
        : targets.annualTargets.sales / 12,
      monthlyGP: targets.inputMethod === 'monthly' 
        ? targets.monthlyTargets.gp[currentMonth - 1] 
        : targets.annualTargets.gp / 12,
      ytdSales: ytdTargets.sales,
      ytdGP: ytdTargets.gp
    };
    
    localStorage.setItem('salesTargets', JSON.stringify(legacyTargets));
    
    toast({
      title: "Targets Saved",
      description: "Enhanced sales and GP targets have been updated successfully.",
    });
    
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const rolloverStrategies = [
    {
      value: 'none',
      label: 'No Rollover',
      description: 'Each month is independent, gaps don\'t carry forward'
    },
    {
      value: 'cumulative',
      label: 'Cumulative Rollover',
      description: 'Monthly shortfalls add to future months\' targets'
    },
    {
      value: 'quarterly',
      label: 'Quarterly Rollover',
      description: 'Gaps roll within quarters only'
    },
    {
      value: 'redistribute',
      label: 'Annual Redistribute',
      description: 'Redistribute remaining annual target across remaining months'
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Enhanced Target Management</h1>
                <p className="text-muted-foreground">Set flexible targets with rollover strategies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Input Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Target Input Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Input Method</Label>
                    <Tabs 
                      value={targets.inputMethod} 
                      onValueChange={(value) => setTargets(prev => ({ 
                        ...prev, 
                        inputMethod: value as 'monthly' | 'annual' 
                      }))}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">Monthly Detail</TabsTrigger>
                        <TabsTrigger value="annual">Annual Summary</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Rollover Strategy</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-2">
                            {rolloverStrategies.map((strategy) => (
                              <div key={strategy.value}>
                                <strong>{strategy.label}:</strong> {strategy.description}
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select 
                      value={targets.rolloverStrategy} 
                      onValueChange={(value) => setTargets(prev => ({ 
                        ...prev, 
                        rolloverStrategy: value as any 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rolloverStrategies.map((strategy) => (
                          <SelectItem key={strategy.value} value={strategy.value}>
                            {strategy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Input Tabs */}
            <Tabs value={targets.inputMethod}>
              <TabsContent value="monthly" className="space-y-6">
                {!previewMode ? (
                  <MonthlyTargetsInput
                    salesTargets={targets.monthlyTargets.sales}
                    gpTargets={targets.monthlyTargets.gp}
                    onSalesTargetChange={handleSalesTargetChange}
                    onGPTargetChange={handleGPTargetChange}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Monthly Preview from Annual Targets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {months.map((month, index) => (
                          <div key={month} className="text-center p-2 border rounded">
                            <div className="font-semibold text-sm">{month}</div>
                            <div className="text-xs text-muted-foreground">
                              Sales: ฿{((previewTargets?.sales[index] || 0) / 1000000).toFixed(1)}M
                            </div>
                            <div className="text-xs text-muted-foreground">
                              GP: ฿{((previewTargets?.gp[index] || 0) / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleApplyPreview}>Apply These Targets</Button>
                        <Button variant="outline" onClick={() => setPreviewMode(false)}>
                          Cancel Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="annual" className="space-y-6">
                <AnnualTargetsInput
                  annualSales={targets.annualTargets.sales}
                  annualGP={targets.annualTargets.gp}
                  distribution={targets.annualTargets.distribution}
                  weights={targets.annualTargets.weights}
                  onAnnualSalesChange={(value) => setTargets(prev => ({
                    ...prev,
                    annualTargets: { ...prev.annualTargets, sales: value }
                  }))}
                  onAnnualGPChange={(value) => setTargets(prev => ({
                    ...prev,
                    annualTargets: { ...prev.annualTargets, gp: value }
                  }))}
                  onDistributionChange={(distribution) => setTargets(prev => ({
                    ...prev,
                    annualTargets: { ...prev.annualTargets, distribution }
                  }))}
                  onWeightsChange={(weights) => setTargets(prev => ({
                    ...prev,
                    annualTargets: { ...prev.annualTargets, weights }
                  }))}
                  onPreviewMonthly={handlePreviewMonthly}
                />
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Enhanced Targets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Targets;
