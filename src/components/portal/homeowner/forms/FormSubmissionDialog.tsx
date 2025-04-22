
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface FormSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any; // Change this to your form type
  formData?: Record<string, any>;
  values?: Record<string, any>; // Alternative name for formData
  onFieldChange: (fieldId: string, value: any) => void;
  onSubmit: () => Promise<boolean>;
  isSubmitting: boolean;
}

const FormSubmissionDialog: React.FC<FormSubmissionDialogProps> = ({
  open,
  onOpenChange,
  form,
  formData = {},
  values = {},
  onFieldChange,
  onSubmit,
  isSubmitting
}) => {
  // Use either formData or values, with formData taking precedence
  const fieldValues = Object.keys(formData).length > 0 ? formData : values;
  
  const renderFormField = (field: any) => {
    switch(field.type) {
      case 'text':
        return (
          <div className="mb-4" key={field.id}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={fieldValues[field.id] || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="mb-4" key={field.id}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              value={fieldValues[field.id] || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              required={field.required}
              rows={4}
            />
          </div>
        );
      default:
        return (
          <div className="mb-4" key={field.id}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={fieldValues[field.id] || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{form?.title || 'Submit Form'}</DialogTitle>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="py-4">
          {form?.fields?.map(renderFormField)}
          
          {!form?.fields && (
            <div className="text-center text-muted-foreground">
              No fields found in this form.
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormSubmissionDialog;
