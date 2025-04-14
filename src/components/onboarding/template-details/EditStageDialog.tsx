
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { OnboardingStage } from '@/types/onboarding-types';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { toast } from 'sonner';

interface EditStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: OnboardingStage;
  onSubmit: () => void;
}

const EditStageDialog = ({ open, onOpenChange, stage, onSubmit }: EditStageDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimated_days: 0
  });

  const { updateStage, isUpdating } = useOnboardingTemplates();

  useEffect(() => {
    if (open && stage) {
      setFormData({
        name: stage.name,
        description: stage.description || '',
        estimated_days: stage.estimated_days || 0
      });
    }
  }, [open, stage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'estimated_days' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Stage name is required');
      return;
    }

    try {
      await updateStage({
        id: stage.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          estimated_days: formData.estimated_days
        }
      });
      
      onOpenChange(false);
      onSubmit();
      toast.success('Stage updated successfully');
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Stage</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-stage-name">Stage Name</Label>
            <Input
              id="edit-stage-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter stage name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-stage-description">Description</Label>
            <Textarea
              id="edit-stage-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter stage description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-stage-days">Estimated Days</Label>
            <Input
              id="edit-stage-days"
              name="estimated_days"
              type="number"
              min="0"
              value={formData.estimated_days}
              onChange={handleInputChange}
              placeholder="Enter estimated days"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStageDialog;
