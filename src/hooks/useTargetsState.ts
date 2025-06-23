
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

  return {
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
  };
};
