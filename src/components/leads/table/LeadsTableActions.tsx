
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { Lead } from '@/types/lead-types';

interface LeadsTableActionsProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: Lead['status']) => void;
}

const LeadsTableActions: React.FC<LeadsTableActionsProps> = ({
  lead,
  onViewDetails,
  onEditLead,
  onDeleteLead,
  onUpdateLeadStatus
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(lead)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditLead(lead)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdateLeadStatus(lead.id, 'qualified')}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Qualified
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => onDeleteLead(lead.id)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Lead
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeadsTableActions;
