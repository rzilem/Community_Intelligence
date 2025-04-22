
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormTemplate } from '@/types/form-builder-types';

interface FormSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormTemplate | null;
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const FormSubmissionDialog = ({
  open,
  onOpenChange,
  form,
  formData,
  onFieldChange,
  onSubmit,
  isSubmitting
}: FormSubmissionDialogProps) => {
  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{form.name}</DialogTitle>
          <DialogDescription>
            {form.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {form.fields.map((field: any) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              
              {field.type === 'text' && (
                <Input
                  id={field.id}
                  placeholder={field.placeholder || ''}
                  value={formData[field.id] || ''}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}
              
              {field.type === 'textarea' && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder || ''}
                  value={formData[field.id] || ''}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}
              
              {field.type === 'select' && (
                <Select
                  value={formData[field.id] || ''}
                  onValueChange={(value) => onFieldChange(field.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || 'Select an option'} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {field.helpText && (
                <p className="text-sm text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormSubmissionDialog;
