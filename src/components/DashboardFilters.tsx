
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Filter } from 'lucide-react';

interface DashboardFiltersProps {
  filters: {
    businessUnit: string;
    customerName: string;
    salesperson: string;
  };
  onFilterChange: (filters: any) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ filters, onFilterChange }) => {
  // Ensure consistent business unit options across the application
  const businessUnits = ['All', 'Coil', 'Unit', 'M&E', 'HBPM', 'MKT'];
  const customers = ['All', 'Toyota Motor Thailand', 'Honda Automobile Thailand', 'Isuzu Motors'];
  const salespeople = ['All', 'John Smith', 'Sarah Johnson', 'Mike Chen'];

  const handleFilterChange = (filterType: string, value: string) => {
    console.log(`Filter change: ${filterType} = ${value}`);
    onFilterChange({
      ...filters,
      [filterType]: value.toLowerCase() === 'all' ? 'all' : value
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Business Unit:</label>
            <Select 
              value={filters.businessUnit === 'all' ? 'All' : filters.businessUnit} 
              onValueChange={(value) => handleFilterChange('businessUnit', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {businessUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Customer:</label>
            <Select 
              value={filters.customerName === 'all' ? 'All' : filters.customerName} 
              onValueChange={(value) => handleFilterChange('customerName', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Salesperson:</label>
            <Select 
              value={filters.salesperson === 'all' ? 'All' : filters.salesperson} 
              onValueChange={(value) => handleFilterChange('salesperson', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {salespeople.map(person => (
                  <SelectItem key={person} value={person}>{person}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
