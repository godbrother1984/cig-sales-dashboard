
import React from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent } from '../components/ui/tabs';
import { TooltipProvider } from '../components/ui/tooltip';
import { MonthlyTargetsInput } from '../components/MonthlyTargetsInput';
import { AnnualTargetsInput } from '../components/AnnualTargetsInput';
import { InputMethodConfig } from '../components/InputMethodConfig';
import { MonthlyPreview } from '../components/MonthlyPreview';
import { useTargetsState } from '../hooks/useTargetsState';

const Targets = () => {
  const {
    targets,
    setTargets,
    previewMode,
    setPreviewMode,
    previewTargets,
    handleSalesTargetChange,
    handleGPTargetChange,
    handlePreviewMonthly,
    handleApplyPreview,
    handleSave
  } = useTargetsState();

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
            
            <InputMethodConfig
              inputMethod={targets.inputMethod}
              rolloverStrategy={targets.rolloverStrategy}
              onInputMethodChange={(method) => setTargets(prev => ({ 
                ...prev, 
                inputMethod: method 
              }))}
              onRolloverStrategyChange={(strategy) => setTargets(prev => ({ 
                ...prev, 
                rolloverStrategy: strategy as any 
              }))}
            />

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
                  previewTargets && (
                    <MonthlyPreview
                      previewTargets={previewTargets}
                      onApplyPreview={handleApplyPreview}
                      onCancelPreview={() => setPreviewMode(false)}
                    />
                  )
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
