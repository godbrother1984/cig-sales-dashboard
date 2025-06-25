
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { EnhancedTargets } from '../types';
import { calculateMonthlyTargetsFromAnnual, calculateYTDTarget } from '../utils/targetCalculations';

export const useTargetsState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [targets, setTargets] = useState<EnhancedTargets>({
    inputMethod: 'monthly',
    rolloverStrategy: 'none',
    globalTargets: true,
    selectedBusinessUnit: 'Coils',
    businessUnitTargets: {
      Coils: {
        monthlyTargets: { sales: Array(12).fill(3200000), gp: Array(12).fill(800000) },
        annualTargets: { sales: 38400000, gp: 9600000, distribution: 'equal' }
      },
      Units: {
        monthlyTargets: { sales: Array(12).fill(2800000), gp: Array(12).fill(700000) },
        annualTargets: { sales: 33600000, gp: 8400000, distribution: 'equal' }
      },
      'M&E': {
        monthlyTargets: { sales: Array(12).fill(4000000), gp: Array(12).fill(1000000) },
        annualTargets: { sales: 48000000, gp: 12000000, distribution: 'equal' }
      },
      HBPM: {
        monthlyTargets: { sales: Array(12).fill(1800000), gp: Array(12).fill(450000) },
        annualTargets: { sales: 21600000, gp: 5400000, distribution: 'equal' }
      }
    },
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
      const parsed = JSON.parse(savedTargets);
      // Migration logic for old format and old business unit names
      if (!parsed.businessUnitTargets) {
        parsed.globalTargets = true;
        parsed.selectedBusinessUnit = 'Coils';
        parsed.businessUnitTargets = {
          Coils: {
            monthlyTargets: parsed.monthlyTargets || { sales: Array(12).fill(3200000), gp: Array(12).fill(800000) },
            annualTargets: parsed.annualTargets || { sales: 38400000, gp: 9600000, distribution: 'equal' }
          }
        };
      }
      
      // Migration from old business unit names to new ones
      const oldToNewMapping = {
        'Corporate': 'Coils',
        'Retail': 'Units',
        'Manufacturing': 'M&E',
        'Services': 'HBPM'
      };
      
      if (parsed.businessUnitTargets) {
        const newBusinessUnitTargets: any = {};
        Object.keys(parsed.businessUnitTargets).forEach(oldKey => {
          const newKey = oldToNewMapping[oldKey as keyof typeof oldToNewMapping] || oldKey;
          newBusinessUnitTargets[newKey] = parsed.businessUnitTargets[oldKey];
        });
        parsed.businessUnitTargets = newBusinessUnitTargets;
      }
      
      if (parsed.selectedBusinessUnit && oldToNewMapping[parsed.selectedBusinessUnit as keyof typeof oldToNewMapping]) {
        parsed.selectedBusinessUnit = oldToNewMapping[parsed.selectedBusinessUnit as keyof typeof oldToNewMapping];
      }
      
      setTargets(parsed);
    }
  }, []);

  const getCurrentTargets = () => {
    if (targets.globalTargets) {
      return {
        monthlyTargets: targets.monthlyTargets,
        annualTargets: targets.annualTargets
      };
    } else {
      return targets.businessUnitTargets[targets.selectedBusinessUnit] || {
        monthlyTargets: { sales: Array(12).fill(0), gp: Array(12).fill(0) },
        annualTargets: { sales: 0, gp: 0, distribution: 'equal' as const }
      };
    }
  };

  const updateCurrentTargets = (updates: any) => {
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
  };

  const handleSalesTargetChange = (month: number, value: number) => {
    const currentTargets = getCurrentTargets();
    const newMonthlyTargets = {
      ...currentTargets.monthlyTargets,
      sales: currentTargets.monthlyTargets.sales.map((target, index) => 
        index === month ? value : target
      )
    };
    updateCurrentTargets({ monthlyTargets: newMonthlyTargets });
  };

  const handleGPTargetChange = (month: number, value: number) => {
    const currentTargets = getCurrentTargets();
    const newMonthlyTargets = {
      ...currentTargets.monthlyTargets,
      gp: currentTargets.monthlyTargets.gp.map((target, index) => 
        index === month ? value : target
      )
    };
    updateCurrentTargets({ monthlyTargets: newMonthlyTargets });
  };

  const handlePreviewMonthly = () => {
    console.log('Preview Monthly called'); // Debug log
    const currentTargets = getCurrentTargets();
    console.log('Current targets for preview:', currentTargets); // Debug log
    
    const weights = ('weights' in currentTargets.annualTargets) ? currentTargets.annualTargets.weights || [] : [];
    
    const preview = calculateMonthlyTargetsFromAnnual(
      currentTargets.annualTargets.sales,
      currentTargets.annualTargets.gp,
      currentTargets.annualTargets.distribution,
      weights
    );
    
    console.log('Generated preview:', preview); // Debug log
    setPreviewTargets(preview);
    setPreviewMode(true);
    console.log('Preview mode set to true'); // Debug log
  };

  const handleApplyPreview = () => {
    if (previewTargets) {
      updateCurrentTargets({ monthlyTargets: previewTargets });
      setPreviewMode(false);
      setPreviewTargets(null);
    }
  };

  const handleSave = () => {
    localStorage.setItem('enhancedSalesTargets', JSON.stringify(targets));
    
    // Also save in legacy format for compatibility
    const currentMonth = new Date().getMonth() + 1;
    const currentTargets = getCurrentTargets();
    const ytdTargets = calculateYTDTarget({ ...targets, ...currentTargets }, currentMonth);
    
    const legacyTargets = {
      monthlySales: targets.inputMethod === 'monthly' 
        ? currentTargets.monthlyTargets.sales[currentMonth - 1] 
        : currentTargets.annualTargets.sales / 12,
      monthlyGP: targets.inputMethod === 'monthly' 
        ? currentTargets.monthlyTargets.gp[currentMonth - 1] 
        : currentTargets.annualTargets.gp / 12,
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

  return {
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
  };
};
