
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
import { Trash2 } from 'lucide-react';

interface FormFieldEditorProps {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
  onDelete: () => void;
}

const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  field,
  onChange,
  onDelete,
}) => {
  const handleTypeChange = (type: FormFieldType) => {
    onChange({ type });
  };

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
            onValueChange={(value) => handleTypeChange(value as FormFieldType)}
          >
            <SelectTrigger id="field-type">
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Text Area</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="radio">Radio Buttons</SelectItem>
              <SelectItem value="file">File Upload</SelectItem>
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
      </CardContent>
    </Card>
  );
};

export default FormFieldEditor;
