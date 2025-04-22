
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormTemplate, FormField } from '@/types/form-builder-types';
import { Loader2 } from 'lucide-react';

interface FormSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormTemplate | null;
  values: Record<string, any>;
  onFieldChange: (id: string, value: any) => void;
  onSubmit: () => Promise<boolean>;
  isSubmitting: boolean;
}

const FormSubmissionDialog: React.FC<FormSubmissionDialogProps> = ({
  open,
  onOpenChange,
  form,
  values,
  onFieldChange,
  onSubmit,
  isSubmitting
}) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Reset errors when form changes or dialog opens/closes
  useEffect(() => {
    setFormErrors({});
  }, [form, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const errors: Record<string, string> = {};
    const visibleFields = getVisibleFields(form?.fields || []);
    
    visibleFields.forEach(field => {
      if (field.required && (!values[field.id] || values[field.id] === '')) {
        errors[field.id] = 'This field is required';
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear errors and submit
    setFormErrors({});
    const success = await onSubmit();
    if (success) {
      onOpenChange(false);
    }
  };

  // Determine if a field should be visible based on conditional logic
  const shouldShowField = (field: FormField): boolean => {
    if (!field.conditionalDisplay) return true;
    
    const { dependsOn, showWhen } = field.conditionalDisplay;
    const dependentValue = values[dependsOn];
    
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
    const error = formErrors[field.id];
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} className="block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder}
              value={values[field.id] || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} className="block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={values[field.id] || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} className="block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={values[field.id] || ''}
              onValueChange={(value) => onFieldChange(field.id, value)}
            >
              <SelectTrigger id={field.id} className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent position="popper">
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-start space-x-2" key={field.id}>
            <Checkbox
              id={field.id}
              checked={values[field.id] || false}
              onCheckedChange={(checked) => onFieldChange(field.id, checked)}
              className={error ? 'border-red-500' : ''}
            />
            <div>
              <Label htmlFor={field.id} className="cursor-pointer">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2" key={field.id}>
            <Label className="block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={values[field.id] || ''}
              onValueChange={(value) => onFieldChange(field.id, value)}
              className={error ? 'border border-red-500 rounded-md p-2' : ''}
            >
              {field.options?.map(option => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
        
      case 'date':
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} className="block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              placeholder={field.placeholder}
              value={values[field.id] || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} className="block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="border-2 border-dashed rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">
                File upload is not yet implemented
              </p>
            </div>
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
        
      default:
        return (
          <div key={field.id}>
            <p>Unsupported field type: {field.type}</p>
          </div>
        );
    }
  };

  if (!form) return null;

  const visibleFields = getVisibleFields(form.fields || []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.name}</DialogTitle>
          {form.description && <p className="text-sm text-muted-foreground mt-2">{form.description}</p>}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {visibleFields.length > 0 ? (
            visibleFields.map(field => renderField(field))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              This form has no fields.
            </p>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormSubmissionDialog;
