
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { FormTemplate, FormField } from '@/types/form-builder-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormTemplate | null;
  values: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
  onSubmit: () => Promise<boolean>;
  isSubmitting: boolean;
}

const FormSubmissionDialog = ({
  open,
  onOpenChange,
  form,
  values,
  onFieldChange,
  onSubmit,
  isSubmitting
}: FormSubmissionDialogProps) => {
  if (!form) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            required={field.required}
            className="min-h-[100px]"
          />
        );
      case 'select':
        return (
          <Select
            value={values[field.id] || ''}
            onValueChange={(value) => onFieldChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={!!values[field.id]}
              onCheckedChange={(checked) => onFieldChange(field.id, checked)}
            />
            <label
              htmlFor={field.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.placeholder || field.label}
            </label>
          </div>
        );
      case 'radio':
        return (
          <RadioGroup
            value={values[field.id] || ''}
            onValueChange={(value) => onFieldChange(field.id, value)}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      default:
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{form.name}</DialogTitle>
          <DialogDescription>
            {form.description || 'Please fill out the form below.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Form title - used for homeowner request */}
            <div className="space-y-2">
              <Label htmlFor="title">Request Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={values.title || ''}
                onChange={(e) => onFieldChange('title', e.target.value)}
                placeholder="Enter a title for your request"
                required
              />
            </div>

            {/* Homeowner request info */}
            <div className="space-y-2">
              <Label htmlFor="type">Request Type</Label>
              <Select
                value={values.type || 'general'}
                onValueChange={(value) => onFieldChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="architectural">Architectural</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={values.priority || 'medium'}
                onValueChange={(value) => onFieldChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic form fields */}
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </Label>
                {renderField(field)}
                {field.helpText && (
                  <p className="text-xs text-muted-foreground">{field.helpText}</p>
                )}
              </div>
            ))}

            {/* Form description - used for homeowner request */}
            <div className="space-y-2">
              <Label htmlFor="description">Additional Details <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={values.description || ''}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder="Please provide any additional details about your request"
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          
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
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormSubmissionDialog;
