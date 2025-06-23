
import { EnhancedTargets, MonthlyTargetAnalysis } from '../types';

export const getMonthNames = () => [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const calculateMonthlyTargetsFromAnnual = (
  annualSales: number,
  annualGP: number,
  distribution: 'equal' | 'weighted' | 'custom',
  weights?: number[]
): { sales: number[]; gp: number[] } => {
  const months = 12;
  
  if (distribution === 'equal') {
    const monthlySales = annualSales / months;
    const monthlyGP = annualGP / months;
    return {
      sales: Array(months).fill(monthlySales),
      gp: Array(months).fill(monthlyGP)
    };
  }
  
  if (distribution === 'weighted') {
    // Standard business seasonality weights (higher in Q4, lower in summer)
    const defaultWeights = [8, 8, 9, 9, 8, 7, 7, 8, 9, 10, 11, 12];
    const totalWeight = defaultWeights.reduce((sum, w) => sum + w, 0);
    
    return {
      sales: defaultWeights.map(weight => (annualSales * weight) / totalWeight),
      gp: defaultWeights.map(weight => (annualGP * weight) / totalWeight)
    };
  }
  
  if (distribution === 'custom' && weights && weights.length === 12) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    return {
      sales: weights.map(weight => (annualSales * weight) / totalWeight),
      gp: weights.map(weight => (annualGP * weight) / totalWeight)
    };
  }
  
  // Fallback to equal distribution
  return calculateMonthlyTargetsFromAnnual(annualSales, annualGP, 'equal');
};

export const calculateYTDTarget = (
  targets: EnhancedTargets,
  currentMonth: number
): { sales: number; gp: number } => {
  let monthlyTargets = targets.monthlyTargets;
  
  if (targets.inputMethod === 'annual') {
    monthlyTargets = calculateMonthlyTargetsFromAnnual(
      targets.annualTargets.sales,
      targets.annualTargets.gp,
      targets.annualTargets.distribution,
      targets.annualTargets.weights
    );
  }
  
  const sales = monthlyTargets.sales.slice(0, currentMonth).reduce((sum, target) => sum + target, 0);
  const gp = monthlyTargets.gp.slice(0, currentMonth).reduce((sum, target) => sum + target, 0);
  
  return { sales, gp };
};

export const calculateQuarterlyTarget = (
  targets: EnhancedTargets,
  quarter: number
): { sales: number; gp: number } => {
  let monthlyTargets = targets.monthlyTargets;
  
  if (targets.inputMethod === 'annual') {
    monthlyTargets = calculateMonthlyTargetsFromAnnual(
      targets.annualTargets.sales,
      targets.annualTargets.gp,
      targets.annualTargets.distribution,
      targets.annualTargets.weights
    );
  }
  
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 3;
  
  const sales = monthlyTargets.sales.slice(startMonth, endMonth).reduce((sum, target) => sum + target, 0);
  const gp = monthlyTargets.gp.slice(startMonth, endMonth).reduce((sum, target) => sum + target, 0);
  
  return { sales, gp };
};

export const applyRolloverStrategy = (
  targets: EnhancedTargets,
  monthlyActuals: { sales: number[]; gp: number[] },
  currentMonth: number
): EnhancedTargets => {
  if (targets.rolloverStrategy === 'none') {
    return targets;
  }
  
  let adjustedTargets = { ...targets };
  let monthlyTargets = targets.monthlyTargets;
  
  if (targets.inputMethod === 'annual') {
    monthlyTargets = calculateMonthlyTargetsFromAnnual(
      targets.annualTargets.sales,
      targets.annualTargets.gp,
      targets.annualTargets.distribution,
      targets.annualTargets.weights
    );
  }
  
  // Calculate cumulative gaps for completed months
  let salesGap = 0;
  let gpGap = 0;
  
  for (let i = 0; i < currentMonth - 1; i++) {
    salesGap += (monthlyTargets.sales[i] - (monthlyActuals.sales[i] || 0));
    gpGap += (monthlyTargets.gp[i] - (monthlyActuals.gp[i] || 0));
  }
  
  if (targets.rolloverStrategy === 'cumulative') {
    // Add gap to remaining months equally
    const remainingMonths = 12 - currentMonth + 1;
    const salesAddition = salesGap / remainingMonths;
    const gpAddition = gpGap / remainingMonths;
    
    adjustedTargets.monthlyTargets = {
      sales: monthlyTargets.sales.map((target, index) => 
        index >= currentMonth - 1 ? target + salesAddition : target
      ),
      gp: monthlyTargets.gp.map((target, index) => 
        index >= currentMonth - 1 ? target + gpAddition : target
      )
    };
  }
  
  return adjustedTargets;
};
