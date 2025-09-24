
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { getTemplateIcon } from '../onboarding-utils';
import { Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { toast } from 'sonner';

interface TemplateDetailHeaderProps {
  template: OnboardingTemplate;
  onTemplateUpdated: () => void;
}

const TemplateDetailHeader = ({ template, onTemplateUpdated }: TemplateDetailHeaderProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description || '',
    template_type: template.template_type
  });
  
  const { updateTemplate, isUpdating } = useOnboardingTemplates();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      template_type: value as OnboardingTemplate['template_type'] 
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Template name is required');
      return;
    }

    try {
      await updateTemplate(template.id, {
        name: formData.name,
        description: formData.description || undefined,
        template_type: formData.template_type
      });
      
      setIsEditDialogOpen(false);
      onTemplateUpdated();
      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        {getTemplateIcon(template.template_type)}
        <h1 className="text-2xl font-bold ml-2">{template.name}</h1>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Template
      </Button>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Template Name</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter template description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="template_type" className="text-sm font-medium">Template Type</label>
              <Select
                value={formData.template_type}
                onValueChange={handleTemplateTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoa">HOA</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="onsite-hoa">Onsite HOA</SelectItem>
                  <SelectItem value="onsite-condo">Onsite Condo</SelectItem>
                  <SelectItem value="offboarding">Offboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
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
    </div>
  );
};

export default TemplateDetailHeader;
