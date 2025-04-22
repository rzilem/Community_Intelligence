
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { FormTemplate } from '@/types/form-builder-types';

interface FormSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forms: FormTemplate[];
  formsLoading: boolean;
  onFormSelect: (form: FormTemplate) => void;
}

const FormSelectionDialog = ({
  open,
  onOpenChange,
  forms,
  formsLoading,
  onFormSelect
}: FormSelectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit New Request</DialogTitle>
          <DialogDescription>
            Please select a form to submit your request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {formsLoading ? (
            <div className="py-4 text-center text-muted-foreground">
              Loading available forms...
            </div>
          ) : forms.length > 0 ? (
            forms.map(form => (
              <Button
                key={form.id}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => onFormSelect(form)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {form.name}
              </Button>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No request forms are currently available.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormSelectionDialog;
