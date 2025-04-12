
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { templateTypeOptions } from './onboarding-utils';

interface TemplateFormData {
  name: string;
  description: string;
  template_type: OnboardingTemplate['template_type'];
}

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: TemplateFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTemplateTypeChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

const TemplateDialog = ({ 
  open, 
  onOpenChange, 
  formData, 
  onInputChange, 
  onTemplateTypeChange, 
  onSubmit, 
  isEditing 
}: TemplateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Onboarding Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Template Name</label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={onInputChange}
              placeholder="Enter template name" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="template_type" className="text-sm font-medium">Template Type</label>
            <Select 
              value={formData.template_type} 
              onValueChange={onTemplateTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                {templateTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description}
              onChange={onInputChange}
              placeholder="Enter template description" 
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>
            {isEditing ? 'Update' : 'Create'} Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
