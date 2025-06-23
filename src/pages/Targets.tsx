
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
import { BusinessUnitSelector } from '../components/BusinessUnitSelector';
import { useTargetsState } from '../hooks/useTargetsState';

const Targets = () => {
  const {
    targets,
    setTargets,
    previewMode,
    setPreviewMode,
    previewTargets,
    getCurrentTargets,
    handleSalesTargetChange,
    handleGPTargetChange,
    handlePreviewMonthly,
    handleApplyPreview,
    handleSave
  } = useTargetsState();

  const currentTargets = getCurrentTargets();

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
                <p className="text-muted-foreground">Set flexible targets with rollover strategies by Business Unit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <BusinessUnitSelector
              globalTargets={targets.globalTargets}
              selectedBusinessUnit={targets.selectedBusinessUnit}
              onGlobalTargetsChange={(global) => setTargets(prev => ({ 
                ...prev, 
                globalTargets: global 
              }))}
              onBusinessUnitChange={(unit) => setTargets(prev => ({ 
                ...prev, 
                selectedBusinessUnit: unit 
              }))}
            />

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
                    salesTargets={currentTargets.monthlyTargets.sales}
                    gpTargets={currentTargets.monthlyTargets.gp}
                    onSalesTargetChange={handleSalesTargetChange}
                    onGPTargetChange={handleGPTargetChange}
                  />
                ) : (
                  previewTargets && (
                    <MonthlyPreview
                      previewTargets={previewTargets}
                      onApplyPreview={handleApplyPreview}
                      onCancelPreview={() => {
                        console.log('Canceling preview'); // Debug log
                        setPreviewMode(false);
                      }}
                    />
                  )
                )}
              </TabsContent>
              
              <TabsContent value="annual" className="space-y-6">
                <AnnualTargetsInput
                  annualSales={currentTargets.annualTargets.sales}
                  annualGP={currentTargets.annualTargets.gp}
                  distribution={currentTargets.annualTargets.distribution}
                  weights={currentTargets.annualTargets.weights}
                  onAnnualSalesChange={(value) => {
                    const newAnnualTargets = { ...currentTargets.annualTargets, sales: value };
                    updateCurrentTargets({ annualTargets: newAnnualTargets });
                  }}
                  onAnnualGPChange={(value) => {
                    const newAnnualTargets = { ...currentTargets.annualTargets, gp: value };
                    updateCurrentTargets({ annualTargets: newAnnualTargets });
                  }}
                  onDistributionChange={(distribution) => {
                    const newAnnualTargets = { ...currentTargets.annualTargets, distribution };
                    updateCurrentTargets({ annualTargets: newAnnualTargets });
                  }}
                  onWeightsChange={(weights) => {
                    const newAnnualTargets = { ...currentTargets.annualTargets, weights };
                    updateCurrentTargets({ annualTargets: newAnnualTargets });
                  }}
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

  function updateCurrentTargets(updates: any) {
    if (targets.globalTargets) {
      setTargets(prev => ({ ...prev, ...updates }));
    } else {
      setTargets(prev => ({
        ...prev,
        businessUnitTargets: {
          ...prev.businessUnitTargets,
          [prev.selectedBusinessUnit]: {
            ...prev.businessUnitTargets[prev.selectedBusinessUnit],
            ...updates
          }
        }
      }));
    }
  }
};

export default Targets;
