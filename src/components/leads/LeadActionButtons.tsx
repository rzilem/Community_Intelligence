
import React from 'react';
import { Button } from '@/components/ui/button';
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
      <Button 
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={onCreateTestLead}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Test Lead
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        Email Campaign
      </Button>
    </div>
  );
};

export default LeadActionButtons;
