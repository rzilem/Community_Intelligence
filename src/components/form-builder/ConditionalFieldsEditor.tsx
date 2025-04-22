
import React, { useState } from 'react';
import { FormField } from '@/types/form-builder-types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CircleArrowDown, CircleArrowUp, CircleArrowLeft, CircleArrowRight } from 'lucide-react';

interface ConditionalFieldsEditorProps {
  allFields: FormField[];
  currentField: FormField;
  onChange: (field: FormField) => void;
}

const ConditionalFieldsEditor: React.FC<ConditionalFieldsEditorProps> = ({
  allFields,
  currentField,
  onChange
}) => {
  const [enabled, setEnabled] = useState(!!currentField.conditionalDisplay);
  
  const availableFields = allFields.filter(f => 
    f.id !== currentField.id && 
    ['text', 'select', 'checkbox', 'radio', 'number'].includes(f.type)
  );

  const handleToggleConditional = (checked: boolean) => {
    setEnabled(checked);
    
    if (checked && !currentField.conditionalDisplay) {
      // Initialize conditional logic if enabled
      onChange({
        ...currentField,
        conditionalDisplay: {
          dependsOn: availableFields.length > 0 ? availableFields[0].id : '',
          showWhen: ''
        }
      });
    } else if (!checked && currentField.conditionalDisplay) {
      // Remove conditional logic if disabled
      const { conditionalDisplay, ...fieldWithoutConditional } = currentField;
      onChange(fieldWithoutConditional as FormField);
    }
  };

  const handleDependsOnChange = (fieldId: string) => {
    if (!currentField.conditionalDisplay) return;
    
    onChange({
      ...currentField,
      conditionalDisplay: {
        ...currentField.conditionalDisplay,
        dependsOn: fieldId,
        showWhen: '' // Reset the value when changing the dependency
      }
    });
  };

  const handleConditionValueChange = (value: string) => {
    if (!currentField.conditionalDisplay) return;
    
    onChange({
      ...currentField,
      conditionalDisplay: {
        ...currentField.conditionalDisplay,
        showWhen: value
      }
    });
  };

  // Find the dependsOn field to determine what type of input to show
  const dependentField = currentField.conditionalDisplay?.dependsOn 
    ? allFields.find(f => f.id === currentField.conditionalDisplay?.dependsOn)
    : null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <CircleArrowDown className="mr-2 h-4 w-4" />
          Conditional Display Logic
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-conditional" className="cursor-pointer">
              Enable conditional logic
            </Label>
            <Switch
              id="enable-conditional"
              checked={enabled}
              onCheckedChange={handleToggleConditional}
            />
          </div>

          {enabled && currentField.conditionalDisplay && (
            <>
              <div className="space-y-2">
                <Label>Show this field when</Label>
                <Select
                  value={currentField.conditionalDisplay.dependsOn}
                  onValueChange={handleDependsOnChange}
                  disabled={availableFields.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(field => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {dependentField && (
                <div className="space-y-2">
                  <Label>
                    {dependentField.type === 'checkbox' 
                      ? 'is checked' 
                      : 'has value'}
                  </Label>
                  
                  {dependentField.type === 'checkbox' ? (
                    <Select
                      value={String(currentField.conditionalDisplay.showWhen)}
                      onValueChange={handleConditionValueChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Checked</SelectItem>
                        <SelectItem value="false">Unchecked</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : dependentField.type === 'select' || dependentField.type === 'radio' ? (
                    <Select
                      value={String(currentField.conditionalDisplay.showWhen)}
                      onValueChange={handleConditionValueChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a value" />
                      </SelectTrigger>
                      <SelectContent>
                        {dependentField.options?.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={String(currentField.conditionalDisplay.showWhen || '')}
                      onChange={e => handleConditionValueChange(e.target.value)}
                      placeholder={`Enter ${dependentField.type} value`}
                    />
                  )}
                </div>
              )}

              <div className="flex items-center space-x-1 text-sm text-muted-foreground border-t pt-3">
                <CircleArrowRight className="h-4 w-4" />
                <span>This field will only be visible when condition is met</span>
              </div>
            </>
          )}

          {enabled && availableFields.length === 0 && (
            <div className="text-amber-600 text-sm">
              You need at least one other field to create conditional logic
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConditionalFieldsEditor;
