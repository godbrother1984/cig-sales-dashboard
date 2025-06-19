
export const getQuarterBounds = (month: number) => {
  if (month <= 2) return { start: 0, end: 2, quarter: 'Q1' };
  if (month <= 5) return { start: 3, end: 5, quarter: 'Q2' };
  if (month <= 8) return { start: 6, end: 8, quarter: 'Q3' };
  return { start: 9, end: 11, quarter: 'Q4' };
};

export const getQuarterMonths = (month: number) => {
  const bounds = getQuarterBounds(month);
  return { start: bounds.start, end: Math.min(bounds.end, month) };
};
