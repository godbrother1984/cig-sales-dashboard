
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Building2 } from 'lucide-react';

interface BusinessUnitSelectorProps {
  globalTargets: boolean;
  selectedBusinessUnit: string;
  onGlobalTargetsChange: (global: boolean) => void;
  onBusinessUnitChange: (unit: string) => void;
}

const businessUnits = ['Corporate', 'Retail', 'Manufacturing', 'Services'];

export const BusinessUnitSelector: React.FC<BusinessUnitSelectorProps> = ({
  globalTargets,
  selectedBusinessUnit,
  onGlobalTargetsChange,
  onBusinessUnitChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Unit Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="globalTargets"
            checked={globalTargets}
            onCheckedChange={onGlobalTargetsChange}
          />
          <Label htmlFor="globalTargets">
            Use Global Targets (same for all Business Units)
          </Label>
        </div>

        {!globalTargets && (
          <div className="space-y-2">
            <Label>Select Business Unit to Configure</Label>
            <Select value={selectedBusinessUnit} onValueChange={onBusinessUnitChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a business unit" />
              </SelectTrigger>
              <SelectContent>
                {businessUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!globalTargets && (
          <div className="text-sm text-muted-foreground">
            Configure targets separately for each Business Unit. 
            Switch between units to set individual targets.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
