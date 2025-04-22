
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { CheckIcon, Loader2, CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { FormTemplate } from '@/types/form-builder-types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useFormCalendarIntegration } from '@/hooks/portal/useFormCalendarIntegration';
import { cn } from '@/lib/utils';

interface FormSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormTemplate | null;
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
  onSubmit: () => Promise<boolean>;
  isSubmitting: boolean;
}

const FormSubmissionDialog: React.FC<FormSubmissionDialogProps> = ({
  open,
  onOpenChange,
  form,
  formData,
  onFieldChange,
  onSubmit,
  isSubmitting
}) => {
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [calendarSuccess, setCalendarSuccess] = useState(false);
  const { createCalendarEvent, isCreating } = useFormCalendarIntegration();
  
  // Check if this is a form that can be added to the calendar (amenity booking, event registration, etc.)
  const isCalendarCompatible = form?.form_type === 'amenity_booking';
  
  // Function to handle form submission
  const handleSubmit = async () => {
    const success = await onSubmit();
    
    // If successful and user wants to add to calendar
    if (success && isAddingToCalendar && isCalendarCompatible) {
      try {
        // Create calendar event from form data
        const eventSuccess = await createCalendarEvent({
          title: formData.title || form?.name || 'Booking',
          description: formData.description || '',
          date: new Date(formData.date || Date.now()),
          startTime: formData.startTime || '12:00',
          endTime: formData.endTime || '13:00',
          location: formData.location || '',
          type: 'amenity_booking',
          amenityId: formData.amenityId || ''
        });
        
        setCalendarSuccess(eventSuccess);
      } catch (error) {
        console.error('Error creating calendar event:', error);
        setCalendarSuccess(false);
      }
    }
  };
  
  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.name}</DialogTitle>
          {form.description && <DialogDescription>{form.description}</DialogDescription>}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {form.fields.map((field) => {
            switch (field.type) {
              case 'text':
              case 'email':
              case 'phone':
              case 'number':
                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={field.id}
                      type={field.type === 'number' ? 'number' : 'text'}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => onFieldChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  </div>
                );
              case 'textarea':
                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => onFieldChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  </div>
                );
              case 'date':
                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" /> 
                      <Input
                        id={field.id}
                        type="date"
                        value={formData[field.id] || ''}
                        onChange={(e) => onFieldChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    </div>
                  </div>
                );
              case 'time':
                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={field.id}
                      type="time"
                      value={formData[field.id] || ''}
                      onChange={(e) => onFieldChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  </div>
                );
              default:
                return null;
            }
          })}
          
          {/* Calendar integration option for compatible forms */}
          {isCalendarCompatible && (
            <div className={cn(
              "border rounded-lg p-3 mt-4", 
              isAddingToCalendar ? "bg-primary/5 border-primary/30" : "bg-muted/20"
            )}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="calendar-integration">Add to Calendar</Label>
                  <p className="text-xs text-muted-foreground">
                    Create a calendar event when submitting this form
                  </p>
                </div>
                <Switch
                  id="calendar-integration"
                  checked={isAddingToCalendar}
                  onCheckedChange={setIsAddingToCalendar}
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isCreating}>
            {isSubmitting || isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSubmitting && !isCreating ? 'Submitting...' : ''}
                {isCreating ? 'Adding to Calendar...' : ''}
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormSubmissionDialog;
