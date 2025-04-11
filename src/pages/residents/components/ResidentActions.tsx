
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TooltipButton from '@/components/ui/tooltip-button';
import AddOwnerForm from '../AddOwnerForm';

interface ResidentActionsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  onAddSuccess: (newOwner: any) => void;
}

const ResidentActions: React.FC<ResidentActionsProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  onAddSuccess
}) => {
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <TooltipButton 
          variant="default" 
          tooltip="Add a new owner"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Owner
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Owner</DialogTitle>
        </DialogHeader>
        <AddOwnerForm 
          onSuccess={onAddSuccess} 
          onCancel={() => setIsAddDialogOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResidentActions;
