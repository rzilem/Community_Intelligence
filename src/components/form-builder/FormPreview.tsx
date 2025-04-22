
import React, { useState } from 'react';
import { FormField, FormFieldType, FormTemplate } from '@/types/form-builder-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface FormPreviewProps {
  form: FormTemplate | null;
  showHeader?: boolean;
}

const FormPreview: React.FC<FormPreviewProps> = ({ form, showHeader = true }) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg p-4 text-center text-muted-foreground">
        <div>
          <Eye className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
          <p>Select a form to preview</p>
        </div>
      </div>
    );
  }

  // Handle field value changes (for conditional logic)
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Determine if a field should be visible based on conditional logic
  const shouldShowField = (field: FormField): boolean => {
    if (!field.conditionalDisplay) return true;
    
    const { dependsOn, showWhen } = field.conditionalDisplay;
    const dependentValue = formValues[dependsOn];
    
    // Handle boolean values (checkbox)
    if (typeof showWhen === 'boolean') {
      return Boolean(dependentValue) === showWhen;
    }
    
    // Handle array values (multiple select)
    if (Array.isArray(dependentValue)) {
      return dependentValue.includes(showWhen);
    }
    
    // Handle string/number values
    return String(dependentValue) === String(showWhen);
  };

  // Get visible fields based on current values and conditional logic
  const getVisibleFields = (fields: FormField[]): FormField[] => {
    return fields.filter(shouldShowField);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
      case 'time':
        return (
          <div className="mb-4" key={field.id}>
            <Label htmlFor={field.id} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              {field.label}
            </Label>
            <Input 
              id={field.id}
              type={field.type} 
              placeholder={field.placeholder}
              value={formValues[field.id] || field.defaultValue as string || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="mt-1"
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="mb-4" key={field.id}>
            <Label htmlFor={field.id} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              {field.label}
            </Label>
            <Textarea 
              id={field.id}
              placeholder={field.placeholder}
              value={formValues[field.id] || field.defaultValue as string || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="mt-1"
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div className="mb-4" key={field.id}>
            <Label htmlFor={field.id} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              {field.label}
            </Label>
            <Select 
              value={formValues[field.id] || field.defaultValue as string || ''} 
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger id={field.id} className="mt-1">
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-start space-x-2 mb-4" key={field.id}>
            <Checkbox 
              id={field.id} 
              checked={formValues[field.id] || field.defaultValue as boolean || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <div>
              <Label htmlFor={field.id} className="text-sm font-normal">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </Label>
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          </div>
        );
      
      case 'radio':
        return (
          <div className="mb-4" key={field.id}>
            <Label className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              {field.label}
            </Label>
            <RadioGroup 
              value={formValues[field.id] || field.defaultValue as string || ''} 
              onValueChange={(value) => handleFieldChange(field.id, value)}
              className="mt-2"
            >
              {field.options?.map(option => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="mb-4" key={field.id}>
            <Label htmlFor={field.id} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              {field.label}
            </Label>
            <div className="border rounded-md p-4 mt-1 text-center text-muted-foreground">
              File upload placeholder
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
            )}
          </div>
        );
      
      default:
        return (
          <div className="mb-4" key={field.id}>
            <p>Unsupported field type: {field.type}</p>
          </div>
        );
    }
  };

  const visibleFields = getVisibleFields(form.fields);

  return (
    <Card className="w-full shadow-sm border">
      {showHeader && (
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl">{form.name}</CardTitle>
          {form.description && (
            <p className="text-sm text-muted-foreground">{form.description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="p-6">
        {visibleFields.length > 0 ? (
          visibleFields.map(field => renderField(field))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            This form has no fields yet. Start adding fields to see them in preview.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormPreview;
