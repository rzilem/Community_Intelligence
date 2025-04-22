
import React from 'react';
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

  // Filter fields based on conditional logic
  const getVisibleFields = (fields: FormField[]) => {
    return fields.filter(field => {
      if (!field.conditionalDisplay) return true;
      
      // Simple implementation - we would need more complex logic for production
      // This just shows the concept of conditional fields
      return false; // Hide all conditional fields for now
    });
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
              defaultValue={field.defaultValue as string || ''}
              disabled 
              className="mt-1"
            />
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
              defaultValue={field.defaultValue as string || ''}
              disabled 
              className="mt-1"
            />
          </div>
        );
      
      case 'select':
        return (
          <div className="mb-4" key={field.id}>
            <Label htmlFor={field.id} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              {field.label}
            </Label>
            <Select disabled>
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
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-start space-x-2 mb-4" key={field.id}>
            <Checkbox id={field.id} disabled />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
          </div>
        );
      
      case 'radio':
        return (
          <div className="mb-4" key={field.id}>
            <Label className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              {field.label}
            </Label>
            <RadioGroup defaultValue={field.defaultValue as string} className="mt-2" disabled>
              {field.options?.map(option => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
