
import React from 'react';
import { Lead } from '@/types/lead-types';
import { MoreHorizontal, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface LeadActionsMenuProps {
  lead: Lead;
  onDelete?: (lead: Lead) => Promise<void>;
  onUpdateStatus?: (lead: Lead, status: Lead['status']) => Promise<void>;
}

const LeadActionsMenu = ({ lead, onDelete, onUpdateStatus }: LeadActionsMenuProps) => {
  const handleDeleteLead = async () => {
    if (!onDelete) {
      toast.error("Delete functionality is not implemented yet");
      return;
    }
    
    try {
      await onDelete(lead);
      toast.success(`Lead "${lead.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };
  
  const handleUpdateStatus = async (status: Lead['status']) => {
    if (!onUpdateStatus) {
      toast.error("Status update functionality is not implemented yet");
      return;
    }
    
    try {
      await onUpdateStatus(lead, status);
      toast.success(`Lead status updated to ${status}`);
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }
  };
  
  const getNextStatus = (currentStatus: Lead['status']): Lead['status'] => {
    const statusOrder: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    return statusOrder[nextIndex];
  };
  
  const getPreviousStatus = (currentStatus: Lead['status']): Lead['status'] => {
    const statusOrder: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const previousIndex = currentIndex === 0 ? statusOrder.length - 1 : currentIndex - 1;
    return statusOrder[previousIndex];
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleUpdateStatus(getNextStatus(lead.status))}
          className="flex items-center gap-2"
        >
          <ArrowUp className="h-4 w-4" />
          Move to {getNextStatus(lead.status)}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleUpdateStatus(getPreviousStatus(lead.status))}
          className="flex items-center gap-2"
        >
          <ArrowDown className="h-4 w-4" />
          Move to {getPreviousStatus(lead.status)}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDeleteLead}
          className="flex items-center gap-2 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeadActionsMenu;
