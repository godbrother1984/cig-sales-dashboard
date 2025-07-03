import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { EnhancedTargets } from '../types';
import { calculateMonthlyTargetsFromAnnual, calculateYTDTarget } from '../utils/targetCalculations';

const CURRENT_MIGRATION_VERSION = 1;

const getDefaultTargets = (): EnhancedTargets => ({
  inputMethod: 'monthly',
  rolloverStrategy: 'none',
  globalTargets: true,
  selectedBusinessUnit: 'Coil',
  migrationVersion: CURRENT_MIGRATION_VERSION,
  businessUnitTargets: {
    Coil: {
      monthlyTargets: { sales: Array(12).fill(3200000), gp: Array(12).fill(800000) },
      annualTargets: { sales: 38400000, gp: 9600000, distribution: 'equal' }
    },
    Unit: {
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
    },
    MKT: {
      monthlyTargets: { sales: Array(12).fill(2000000), gp: Array(12).fill(500000) },
      annualTargets: { sales: 24000000, gp: 6000000, distribution: 'equal' }
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

const runMigration = (data: any): EnhancedTargets => {
  console.log('Running migration on data:', data);
  
  const migrated = { ...data };
  
  // Set migration version if not present
  if (!migrated.migrationVersion) {
    migrated.migrationVersion = CURRENT_MIGRATION_VERSION;
  }
  
  // Only run migration if version is outdated
  if (migrated.migrationVersion >= CURRENT_MIGRATION_VERSION) {
    console.log('Migration not needed, version is current');
    return migrated;
  }
  
  console.log('Running migration from version', migrated.migrationVersion, 'to', CURRENT_MIGRATION_VERSION);
  
  // Ensure businessUnitTargets structure exists
  if (!migrated.businessUnitTargets) {
    migrated.globalTargets = true;
    migrated.selectedBusinessUnit = 'Coil';
    migrated.businessUnitTargets = {};
  }
  
  // Migration from old business unit names to new ones
  const oldToNewMapping = {
    'Coils': 'Coil',
    'Units': 'Unit',
    'Corporate': 'Coil',
    'Retail': 'Unit',
    'Manufacturing': 'M&E',
    'Services': 'HBPM'
  };
  
  // Migrate business unit names
  const newBusinessUnitTargets: any = {};
  Object.keys(migrated.businessUnitTargets).forEach(oldKey => {
    const newKey = oldToNewMapping[oldKey as keyof typeof oldToNewMapping] || oldKey;
    newBusinessUnitTargets[newKey] = migrated.businessUnitTargets[oldKey];
  });
  
  // Only add missing business units, don't overwrite existing ones
  const requiredBUs = ['Coil', 'Unit', 'M&E', 'HBPM', 'MKT'];
  const defaultBUTargets = {
    Coil: { sales: Array(12).fill(3200000), gp: Array(12).fill(800000), annualSales: 38400000, annualGp: 9600000 },
    Unit: { sales: Array(12).fill(2800000), gp: Array(12).fill(700000), annualSales: 33600000, annualGp: 8400000 },
    'M&E': { sales: Array(12).fill(4000000), gp: Array(12).fill(1000000), annualSales: 48000000, annualGp: 12000000 },
    HBPM: { sales: Array(12).fill(1800000), gp: Array(12).fill(450000), annualSales: 21600000, annualGp: 5400000 },
    MKT: { sales: Array(12).fill(2000000), gp: Array(12).fill(500000), annualSales: 24000000, annualGp: 6000000 }
  };
  
  requiredBUs.forEach(bu => {
    if (!newBusinessUnitTargets[bu]) {
      console.log('Adding missing business unit:', bu);
      const defaultTargets = defaultBUTargets[bu as keyof typeof defaultBUTargets];
      newBusinessUnitTargets[bu] = {
        monthlyTargets: { sales: defaultTargets.sales, gp: defaultTargets.gp },
        annualTargets: { sales: defaultTargets.annualSales, gp: defaultTargets.annualGp, distribution: 'equal' }
      };
    }
  });
  
  migrated.businessUnitTargets = newBusinessUnitTargets;
  
  // Migrate selectedBusinessUnit
  if (migrated.selectedBusinessUnit && oldToNewMapping[migrated.selectedBusinessUnit as keyof typeof oldToNewMapping]) {
    migrated.selectedBusinessUnit = oldToNewMapping[migrated.selectedBusinessUnit as keyof typeof oldToNewMapping];
  }
  
  // Ensure selectedBusinessUnit is valid
  if (!['Coil', 'Unit', 'M&E', 'HBPM', 'MKT'].includes(migrated.selectedBusinessUnit)) {
    migrated.selectedBusinessUnit = 'Coil';
  }
  
  // Update migration version
  migrated.migrationVersion = CURRENT_MIGRATION_VERSION;
  
  console.log('Migration completed:', migrated);
  return migrated;
};

export const useTargetsState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [targets, setTargets] = useState<EnhancedTargets>(getDefaultTargets());
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewTargets, setPreviewTargets] = useState<{ sales: number[]; gp: number[] } | null>(null);

  useEffect(() => {
    console.log('Loading targets from localStorage...');
    const savedTargets = localStorage.getItem('enhancedSalesTargets');
    
    if (savedTargets) {
      try {
        const parsed = JSON.parse(savedTargets);
        console.log('Loaded saved targets:', parsed);
        
        // Run migration if needed
        const migrated = runMigration(parsed);
        
        // Only update state if migration actually changed something
        if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
          console.log('Migration changed data, saving...');
          localStorage.setItem('enhancedSalesTargets', JSON.stringify(migrated));
        }
        
        setTargets(migrated);
      } catch (error) {
        console.error('Error parsing saved targets:', error);
        setTargets(getDefaultTargets());
      }
    } else {
      console.log('No saved targets found, using defaults');
      setTargets(getDefaultTargets());
    }
    
    setIsLoading(false);
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
    console.log('Preview Monthly called');
    const currentTargets = getCurrentTargets();
    console.log('Current targets for preview:', currentTargets);
    
    const weights = ('weights' in currentTargets.annualTargets) ? currentTargets.annualTargets.weights || [] : [];
    
    const preview = calculateMonthlyTargetsFromAnnual(
      currentTargets.annualTargets.sales,
      currentTargets.annualTargets.gp,
      currentTargets.annualTargets.distribution,
      weights
    );
    
    console.log('Generated preview:', preview);
    setPreviewTargets(preview);
    setPreviewMode(true);
    console.log('Preview mode set to true');
  };

  const handleApplyPreview = () => {
    if (previewTargets) {
      updateCurrentTargets({ monthlyTargets: previewTargets });
      setPreviewMode(false);
      setPreviewTargets(null);
    }
  };

  const handleSave = () => {
    console.log('Saving targets:', targets);
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
    isLoading,
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
