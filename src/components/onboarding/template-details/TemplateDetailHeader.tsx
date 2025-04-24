
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TemplateDetailHeaderProps {
  template: OnboardingTemplate;
  onTemplateUpdated: () => void;
}

const TemplateDetailHeader: React.FC<TemplateDetailHeaderProps> = ({ template, onTemplateUpdated }) => {
  const navigate = useNavigate();
  const { updateTemplate, deleteTemplate, createTemplate } = useOnboardingTemplates();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description || '',
    template_type: template.template_type
  });

  const [duplicateData, setDuplicateData] = useState({
    name: `${template.name} (Copy)`,
    description: template.description || '',
    template_type: template.template_type
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDuplicateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDuplicateData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      template_type: value as OnboardingTemplate['template_type'] 
    }));
  };

  const handleDuplicateTemplateTypeChange = (value: string) => {
    setDuplicateData(prev => ({ 
      ...prev, 
      template_type: value as OnboardingTemplate['template_type'] 
    }));
  };

  const handleUpdateTemplate = async () => {
    try {
      await updateTemplate({
        id: template.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          template_type: formData.template_type
        }
      });
      setIsEditDialogOpen(false);
      onTemplateUpdated();
      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      await deleteTemplate(template.id);
      setIsDeleteDialogOpen(false);
      navigate('/lead-management/onboarding');
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async () => {
    try {
      await createTemplate({
        name: duplicateData.name,
        description: duplicateData.description || undefined,
        template_type: duplicateData.template_type,
        estimated_days: template.estimated_days
      });
      setIsDuplicateDialogOpen(false);
      toast.success('Template duplicated successfully');
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Actions <MoreHorizontal className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDuplicateDialogOpen(true)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Template
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Template
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Template Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-type">Template Type</Label>
              <Select
                value={formData.template_type}
                onValueChange={handleTemplateTypeChange}
              >
                <SelectTrigger id="edit-type">
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-name">Template Name</Label>
              <Input
                id="duplicate-name"
                name="name"
                value={duplicateData.name}
                onChange={handleDuplicateInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duplicate-description">Description</Label>
              <Textarea
                id="duplicate-description"
                name="description"
                value={duplicateData.description}
                onChange={handleDuplicateInputChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duplicate-type">Template Type</Label>
              <Select
                value={duplicateData.template_type}
                onValueChange={handleDuplicateTemplateTypeChange}
              >
                <SelectTrigger id="duplicate-type">
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicateTemplate}>
              Duplicate Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{template.name}" template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TemplateDetailHeader;
