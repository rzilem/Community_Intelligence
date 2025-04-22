
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormTemplate, FormType } from '@/types/form-builder-types';
import { useFormCalendarIntegration } from '@/hooks/portal/useFormCalendarIntegration';

interface FormSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<boolean>;
  form: FormTemplate | null;
}

const FormSubmissionDialog: React.FC<FormSubmissionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  form
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createCalendarEvent, isCreating } = useFormCalendarIntegration();
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // If form submission was successful
      const success = await onSuccess();
      
      // Check if this is an amenity booking form
      if (success && form && form.form_type === 'pool_form') {
        // Extract form fields and create a calendar event
        await createCalendarEvent({
          title: `Pool Booking`,
          description: `Booked through portal form`,
          date: new Date(),
          startTime: '09:00',
          endTime: '11:00',
          type: 'amenity_booking',
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Form Submitted</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Your form has been successfully submitted.</p>
          {form?.form_type === 'pool_form' && (
            <p className="text-sm text-muted-foreground mt-2">
              This will also create a calendar event for your pool booking.
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isCreating}
          >
            Close
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isCreating}
          >
            {isSubmitting || isCreating ? 'Processing...' : 'OK'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormSubmissionDialog;
