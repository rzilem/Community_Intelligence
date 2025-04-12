
import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    description: string;
    estimated_days: number;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

const AddStageDialog = ({ 
  open, 
  onOpenChange, 
  formData, 
  onInputChange, 
  onSubmit 
}: AddStageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Stage</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="stage-name" className="text-sm font-medium">Stage Name</label>
            <Input 
              id="stage-name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Enter stage name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="stage-description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="stage-description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="Enter stage description (optional)"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="stage-days" className="text-sm font-medium">Estimated Days</label>
            <Input 
              id="stage-days"
              name="estimated_days"
              type="number"
              value={formData.estimated_days.toString()}
              onChange={onInputChange}
              min={1}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>Add Stage</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStageDialog;
