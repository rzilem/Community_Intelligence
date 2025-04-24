
import React from 'react';
import TooltipButton from '@/components/ui/tooltip-button';
import { RefreshCw, Plus, Download, Mail } from 'lucide-react';

interface LeadActionButtonsProps {
  onRefresh: () => void;
  onCreateTestLead: () => void;
}

const LeadActionButtons: React.FC<LeadActionButtonsProps> = ({ 
  onRefresh, 
  onCreateTestLead 
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <TooltipButton 
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="flex items-center gap-2"
        tooltip="Refresh lead data"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </TooltipButton>
      
      <TooltipButton
        size="sm"
        variant="outline"
        onClick={onCreateTestLead}
        className="flex items-center gap-2"
        tooltip="Create a test lead for demonstration"
      >
        <Plus className="h-4 w-4" />
        Test Lead
      </TooltipButton>
      
      <TooltipButton
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
        tooltip="Export leads to CSV"
      >
        <Download className="h-4 w-4" />
        Export
      </TooltipButton>
      
      <TooltipButton
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
        tooltip="Create new email campaign"
      >
        <Mail className="h-4 w-4" />
        Email Campaign
      </TooltipButton>
    </div>
  );
};

export default LeadActionButtons;
