
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingTemplate } from '@/types/onboarding-types';
import CreateTemplateOptions from './templates/CreateTemplateOptions';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    description: string;
    template_type: OnboardingTemplate['template_type'];
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTemplateTypeChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onTemplateTypeChange,
  onSubmit,
  isEditing
}) => {
  const [showBasicForm, setShowBasicForm] = React.useState(isEditing);

  const handleBasicTemplateClick = () => {
    setShowBasicForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
        </DialogHeader>

        {!isEditing && !showBasicForm ? (
          <CreateTemplateOptions onCreateBasic={handleBasicTemplateClick} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                placeholder="Enter template name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="Enter template description"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="template-type">Template Type</Label>
              <Select
                value={formData.template_type}
                onValueChange={onTemplateTypeChange}
              >
                <SelectTrigger id="template-type">
                  <SelectValue placeholder="Select template type" />
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

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
