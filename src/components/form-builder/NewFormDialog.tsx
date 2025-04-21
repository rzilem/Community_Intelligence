
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ClipboardList, FileCheck, BarChart4 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewFormDialog: React.FC<NewFormDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPortal, setFormPortal] = useState('homeowner');
  
  const handleCreateForm = () => {
    if (!formName.trim()) {
      toast.error('Please enter a form name');
      return;
    }
    
    if (!formType) {
      toast.error('Please select a form type');
      return;
    }
    
    if (!formCategory) {
      toast.error('Please select a category');
      return;
    }
    
    // This would typically create a new form and redirect to the editor
    toast.success('Form created successfully');
    onOpenChange(false);
    
    // In a real implementation, we would navigate to the form editor with the new form ID
    // navigate(`/system/form-builder/editor/${newFormId}`);
    
    // Reset the form
    setFormName('');
    setFormType('');
    setFormCategory('');
    setFormPortal('homeowner');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a New Form</DialogTitle>
          <DialogDescription>
            Select a form type and provide basic information to get started.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="formName">Form Name</Label>
            <Input
              id="formName"
              placeholder="Enter form name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Form Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer border-2 ${formType === 'standard' ? 'border-primary' : 'border-transparent'}`}
                onClick={() => setFormType('standard')}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <FileText className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="text-sm font-medium">Standard Form</h3>
                  <p className="text-xs text-muted-foreground">
                    Create a general purpose form with various field types
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer border-2 ${formType === 'survey' ? 'border-primary' : 'border-transparent'}`}
                onClick={() => setFormType('survey')}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <BarChart4 className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="text-sm font-medium">Survey</h3>
                  <p className="text-xs text-muted-foreground">
                    Collect responses and analyze results with charts
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer border-2 ${formType === 'application' ? 'border-primary' : 'border-transparent'}`}
                onClick={() => setFormType('application')}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <ClipboardList className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="text-sm font-medium">Application Form</h3>
                  <p className="text-xs text-muted-foreground">
                    Create forms for applications with approval workflow
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer border-2 ${formType === 'waiver' ? 'border-primary' : 'border-transparent'}`}
                onClick={() => setFormType('waiver')}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <FileCheck className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="text-sm font-medium">Waiver/Agreement</h3>
                  <p className="text-xs text-muted-foreground">
                    Create legal forms that require signatures
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="formCategory">Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger id="formCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formPortal">Portal Visibility</Label>
              <Select value={formPortal} onValueChange={setFormPortal}>
                <SelectTrigger id="formPortal">
                  <SelectValue placeholder="Select portal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner">Homeowner Portal</SelectItem>
                  <SelectItem value="board">Board Portal</SelectItem>
                  <SelectItem value="vendor">Vendor Portal</SelectItem>
                  <SelectItem value="all">All Portals</SelectItem>
                  <SelectItem value="external">External Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateForm}>Create Form</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
