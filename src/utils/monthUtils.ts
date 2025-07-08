
const MONTH_ORDER = {
  'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
  'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
};

export const getCurrentMonthKey = (): string => {
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const currentMonth = new Date().getMonth();
  return monthNames[currentMonth];
};

export const isCurrentMonth = (monthKey: string): boolean => {
  const currentMonthKey = getCurrentMonthKey();
  return monthKey.toLowerCase() === currentMonthKey;
};

export const isPastMonth = (monthKey: string): boolean => {
  const currentMonthKey = getCurrentMonthKey();
  const currentOrder = MONTH_ORDER[currentMonthKey as keyof typeof MONTH_ORDER];
  const monthOrder = MONTH_ORDER[monthKey.toLowerCase() as keyof typeof MONTH_ORDER];
  
  return monthOrder < currentOrder;
};

console.log(`Current month: ${getCurrentMonthKey()}`);
