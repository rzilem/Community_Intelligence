
import React from 'react';
import { FormWorkflowCondition } from '@/types/form-workflow-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ConditionEditorProps {
  condition: FormWorkflowCondition;
  onChange: (condition: FormWorkflowCondition) => void;
  onDelete: () => void;
}

const COMMON_FORM_FIELDS = [
  { id: 'title', label: 'Form Title' },
  { id: 'description', label: 'Description' },
  { id: 'priority', label: 'Priority' },
  { id: 'type', label: 'Type' },
  { id: 'status', label: 'Status' },
  { id: 'user.email', label: 'User Email' },
  { id: 'user.role', label: 'User Role' },
  { id: 'custom', label: 'Custom Field' },
];

const ConditionEditor: React.FC<ConditionEditorProps> = ({
  condition,
  onChange,
  onDelete,
}) => {
  const updateCondition = (updates: Partial<FormWorkflowCondition>) => {
    onChange({
      ...condition,
      ...updates,
    });
  };

  const isCustomField = condition.field === 'custom';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Condition Configuration</CardTitle>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Remove Condition
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="condition-field">Field</Label>
          <Select
            value={condition.field || ''}
            onValueChange={(value) => updateCondition({ field: value })}
          >
            <SelectTrigger id="condition-field">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_FORM_FIELDS.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isCustomField && (
          <div className="space-y-2">
            <Label htmlFor="custom-field-name">Custom Field Name</Label>
            <Input
              id="custom-field-name"
              placeholder="Enter the form field name"
              value={condition.customField || ''}
              onChange={(e) =>
                updateCondition({ customField: e.target.value })
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="condition-operator">Operator</Label>
          <Select
            value={condition.operator || 'equals'}
            onValueChange={(value) =>
              updateCondition({ operator: value as any })
            }
          >
            <SelectTrigger id="condition-operator">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="not_equals">Not Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="greater_than">Greater Than</SelectItem>
              <SelectItem value="less_than">Less Than</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition-value">Value</Label>
          <Input
            id="condition-value"
            placeholder="Value to compare against"
            value={condition.value.toString()}
            onChange={(e) => updateCondition({ value: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConditionEditor;
