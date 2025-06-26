
// Business unit mapping utilities

// Business unit mapping from API to application format
const BUSINESS_UNIT_MAPPING: { [key: string]: string } = {
  'Coil': 'Coil',
  'Coil(Unit)': 'Unit',
  'M&E': 'M&E',
  'HBPM': 'HBPM',
  'MKT': 'MKT'
};

export const mapBusinessUnit = (apiBusinessUnit: string): string => {
  return BUSINESS_UNIT_MAPPING[apiBusinessUnit] || apiBusinessUnit;
};

export const normalizeBusinessUnit = (businessUnit: string): string => {
  const mapping: { [key: string]: string } = {
    'coil': 'Coil',
    'unit': 'Unit', 
    'm&e': 'M&E',
    'hbpm': 'HBPM',
    'mkt': 'MKT'
  };
  
  const normalized = businessUnit.toLowerCase();
  return mapping[normalized] || businessUnit;
};

export const logBusinessUnits = (data: any[], type: string) => {
  const businessUnits = new Set();
  data.forEach(item => {
    if (item?.bu) {
      businessUnits.add(item.bu);
    }
  });
  console.log(`${type} business units:`, Array.from(businessUnits));
};
