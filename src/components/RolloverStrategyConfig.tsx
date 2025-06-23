
import React from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface RolloverStrategyConfigProps {
  rolloverStrategy: string;
  onRolloverStrategyChange: (value: string) => void;
}

const rolloverStrategies = [
  {
    value: 'none',
    label: 'No Rollover',
    description: 'Each month is independent, gaps don\'t carry forward'
  },
  {
    value: 'cumulative',
    label: 'Cumulative Rollover',
    description: 'Monthly shortfalls add to future months\' targets'
  },
  {
    value: 'quarterly',
    label: 'Quarterly Rollover',
    description: 'Gaps roll within quarters only'
  },
  {
    value: 'redistribute',
    label: 'Annual Redistribute',
    description: 'Redistribute remaining annual target across remaining months'
  }
];

export const RolloverStrategyConfig: React.FC<RolloverStrategyConfigProps> = ({
  rolloverStrategy,
  onRolloverStrategyChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Rollover Strategy</Label>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              {rolloverStrategies.map((strategy) => (
                <div key={strategy.value}>
                  <strong>{strategy.label}:</strong> {strategy.description}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <Select value={rolloverStrategy} onValueChange={onRolloverStrategyChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {rolloverStrategies.map((strategy) => (
            <SelectItem key={strategy.value} value={strategy.value}>
              {strategy.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
