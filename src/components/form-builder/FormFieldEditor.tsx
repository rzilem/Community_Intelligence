
import React from 'react';
import { FormField, FormFieldType } from '@/types/form-builder-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface FormFieldEditorProps {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  allFields?: FormField[]; // Added to support conditional logic
}

const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  field,
  onChange,
  onDelete,
  allFields = [],
}) => {
  // Define field types with their display names
  const fieldTypes: { value: FormFieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'file', label: 'File Upload' },
  ];

  // Get previous fields that this field could depend on
  const availableDependencyFields = allFields.filter(f => 
    f.id !== field.id && 
    (f.type === 'select' || f.type === 'radio' || f.type === 'checkbox')
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Field Properties</CardTitle>
        <Button variant="outline" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="field-label">Field Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-type">Field Type</Label>
          <Select
            value={field.type}
            onValueChange={(value) => onChange({ type: value as FormFieldType })}
          >
            <SelectTrigger id="field-type" className="w-full">
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent position="popper" className="w-full z-50">
              {fieldTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ''}
            onChange={(e) => onChange({ placeholder: e.target.value })}
          />
        </div>

        {(field.type === 'select' || field.type === 'radio') && (
          <div className="space-y-2">
            <Label htmlFor="field-options">Options (one per line)</Label>
            <Textarea
              id="field-options"
              value={field.options?.map(opt => `${opt.label}|${opt.value}`).join('\n') || ''}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(Boolean);
                const options = lines.map(line => {
                  const [label, value] = line.split('|');
                  return { 
                    label: label.trim(), 
                    value: (value || label).trim() 
                  };
                });
                onChange({ options });
              }}
              placeholder="Option 1|value1&#10;Option 2|value2&#10;Option 3|value3"
              className="min-h-[100px]"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={(checked) => onChange({ required: checked })}
          />
          <Label htmlFor="field-required">Required Field</Label>
        </div>

        {(field.type === 'text' || field.type === 'textarea' || field.type === 'email') && (
          <div className="space-y-2">
            <Label htmlFor="field-help">Help Text</Label>
            <Input
              id="field-help"
              value={field.helpText || ''}
              onChange={(e) => onChange({ helpText: e.target.value })}
              placeholder="Instructions for this field"
            />
          </div>
        )}

        {/* Conditional Logic Section */}
        {availableDependencyFields.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Conditional Display</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="field-dependency">Show this field when</Label>
                <Select
                  value={field.conditionalDisplay?.dependsOn || ""}
                  onValueChange={(value) => {
                    if (!value) {
                      const updatedField = {...field};
                      delete updatedField.conditionalDisplay;
                      onChange(updatedField);
                      return;
                    }
                    
                    onChange({
                      conditionalDisplay: {
                        dependsOn: value,
                        showWhen: field.conditionalDisplay?.showWhen || ""
                      }
                    });
                  }}
                >
                  <SelectTrigger id="field-dependency" className="w-full">
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="w-full z-50">
                    <SelectItem value="">No dependency</SelectItem>
                    {availableDependencyFields.map((depField) => (
                      <SelectItem key={depField.id} value={depField.id}>
                        {depField.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {field.conditionalDisplay?.dependsOn && (
                <div className="space-y-2">
                  <Label htmlFor="field-showWhen">Has value</Label>
                  <Select
                    value={String(field.conditionalDisplay?.showWhen || "")}
                    onValueChange={(value) => {
                      onChange({
                        conditionalDisplay: {
                          ...field.conditionalDisplay,
                          showWhen: value
                        }
                      });
                    }}
                  >
                    <SelectTrigger id="field-showWhen" className="w-full">
                      <SelectValue placeholder="Select a value" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-full z-50">
                      {(() => {
                        const dependentField = availableDependencyFields.find(
                          f => f.id === field.conditionalDisplay?.dependsOn
                        );
                        
                        if (!dependentField || !dependentField.options) {
                          return (
                            <SelectItem value="true">Is checked/selected</SelectItem>
                          );
                        }
                        
                        return dependentField.options.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FormFieldEditor;
