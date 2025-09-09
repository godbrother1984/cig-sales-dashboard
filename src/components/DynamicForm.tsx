import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfigurationService } from '@/services/configurationService';
import { FieldConfiguration, FormConfiguration, ValidationRule, BusinessUnit } from '@/types/configuration';

interface DynamicFormProps {
  formName: string;
  onSubmit: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  className?: string;
}

interface FormErrors {
  [fieldId: string]: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  formName,
  onSubmit,
  initialData = {},
  className = ''
}) => {
  const [formConfig, setFormConfig] = useState<FormConfiguration | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);

  useEffect(() => {
    loadFormConfiguration();
  }, [formName]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...initialData }));
  }, [initialData]);

  const loadFormConfiguration = async () => {
    try {
      setLoading(true);
      const config = await ConfigurationService.getFormConfig(formName);
      
      if (!config) {
        throw new Error(`Form configuration '${formName}' not found`);
      }

      setFormConfig(config);

      // Load business units for form options
      const units = await ConfigurationService.getBusinessUnits(false);
      setBusinessUnits(units);

      // Set default values
      const defaultData: Record<string, any> = {};
      config.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          if (field.defaultValue === 'today' && field.type === 'date') {
            defaultData[field.id] = new Date().toISOString().split('T')[0];
          } else {
            defaultData[field.id] = field.defaultValue;
          }
        }
      });

      setFormData(prev => ({ ...defaultData, ...prev }));

    } catch (error) {
      console.error('Error loading form configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: FieldConfiguration, value: any): string | null => {
    const validation = field.validation;
    if (!validation) return null;

    // Required field validation
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    if (value === undefined || value === null || value === '') return null;

    // Type-specific validations
    if (field.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) return `${field.label} must be a number`;
      
      if (validation.min !== undefined && numValue < validation.min) {
        return `${field.label} must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `${field.label} must not exceed ${validation.max}`;
      }
    }

    if (field.type === 'text' || field.type === 'textarea') {
      const strValue = String(value);
      if (validation.minLength !== undefined && strValue.length < validation.minLength) {
        return `${field.label} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength !== undefined && strValue.length > validation.maxLength) {
        return `${field.label} must not exceed ${validation.maxLength} characters`;
      }
    }

    if (field.type === 'date' && validation.max === 'today') {
      const today = new Date().toISOString().split('T')[0];
      if (value > today) {
        return `${field.label} cannot be in the future`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    if (!formConfig) return false;

    const newErrors: FormErrors = {};
    let isValid = true;

    formConfig.fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    }

    // Handle auto-calculations
    const field = formConfig?.fields.find(f => f.id === fieldId);
    if (field?.autoCalculate) {
      performAutoCalculation(field);
    }
  };

  const performAutoCalculation = (field: FieldConfiguration) => {
    if (!field.autoCalculate) return;

    const { from, formula, condition } = field.autoCalculate;
    
    // Check if all required fields have values
    const hasAllValues = from.every(fieldId => formData[fieldId] !== undefined && formData[fieldId] !== '');
    if (!hasAllValues) return;

    // Evaluate condition if provided
    if (condition) {
      try {
        const conditionResult = eval(condition.replace(/(\w+)/g, (match) => 
          from.includes(match) ? formData[match] : match
        ));
        if (!conditionResult) return;
      } catch (error) {
        console.warn('Error evaluating auto-calculation condition:', error);
        return;
      }
    }

    // Perform calculation
    try {
      const calculatedValue = eval(formula.replace(/(\w+)/g, (match) => 
        from.includes(match) ? formData[match] : match
      ));
      
      setFormData(prev => ({ ...prev, [field.id]: calculatedValue }));
    } catch (error) {
      console.warn('Error performing auto-calculation:', error);
    }
  };

  const getFieldOptions = (field: FieldConfiguration) => {
    if (!field.options) return [];

    // Handle reference to configuration
    if (typeof field.options === 'string') {
      if (field.options === 'businessConfiguration.businessUnits') {
        return businessUnits
          .filter(bu => !field.excludeOptions?.includes(bu.id))
          .map(bu => ({ value: bu.id, label: bu.label }));
      }
      return [];
    }

    // Handle direct options array
    return Array.isArray(field.options) ? field.options : [];
  };

  const renderField = (field: FieldConfiguration) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];
    const options = getFieldOptions(field);

    const commonProps = {
      id: field.id,
      disabled: field.disabled
    };

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <Input
              {...commonProps}
              type="text"
              value={value}
              placeholder={field.placeholder}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <div className="relative">
              <Input
                {...commonProps}
                type="number"
                value={value}
                step={field.step}
                onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || '')}
                className={error ? 'border-red-500' : ''}
              />
              {field.suffix && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {field.suffix}
                </span>
              )}
            </div>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <Input
              {...commonProps}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
              disabled={field.disabled}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label className={field.required ? 'required' : ''}>{field.label}</Label>
            <RadioGroup
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
              disabled={field.disabled}
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer">
                    <div>
                      <div>{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={value}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                disabled={field.disabled}
              />
              <Label htmlFor={field.id} className={`cursor-pointer ${field.required ? 'required' : ''}`}>
                {field.label}
              </Label>
            </div>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <Textarea
              {...commonProps}
              value={value}
              placeholder={field.placeholder}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading form configuration...</div>
        </CardContent>
      </Card>
    );
  }

  if (!formConfig) {
    return (
      <Alert>
        <AlertDescription>
          Form configuration '{formName}' could not be loaded.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {formConfig.layout.sections.length > 0 ? (
        // Render with sections
        <div className="space-y-6">
          {formConfig.layout.sections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid gap-4 ${
                  formConfig.layout.columns > 1 ? `grid-cols-${formConfig.layout.columns}` : ''
                }`}>
                  {section.fields.map(fieldId => {
                    const field = formConfig.fields.find(f => f.id === fieldId);
                    return field ? renderField(field) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Render without sections
        <Card>
          <CardContent className="p-6">
            <div className={`grid gap-4 ${
              formConfig.layout.columns > 1 ? `grid-cols-${formConfig.layout.columns}` : ''
            }`}>
              {formConfig.fields.map(field => renderField(field))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end mt-6">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};