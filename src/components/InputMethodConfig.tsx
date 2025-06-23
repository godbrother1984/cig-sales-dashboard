
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { RolloverStrategyConfig } from './RolloverStrategyConfig';

interface InputMethodConfigProps {
  inputMethod: 'monthly' | 'annual';
  rolloverStrategy: string;
  onInputMethodChange: (method: 'monthly' | 'annual') => void;
  onRolloverStrategyChange: (strategy: string) => void;
}

export const InputMethodConfig: React.FC<InputMethodConfigProps> = ({
  inputMethod,
  rolloverStrategy,
  onInputMethodChange,
  onRolloverStrategyChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Input Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Input Method</Label>
            <Tabs value={inputMethod} onValueChange={onInputMethodChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly Detail</TabsTrigger>
                <TabsTrigger value="annual">Annual Summary</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <RolloverStrategyConfig
            rolloverStrategy={rolloverStrategy}
            onRolloverStrategyChange={onRolloverStrategyChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
