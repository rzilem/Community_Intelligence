
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';
import { ResidentDialog } from '@/components/residents/ResidentDialog';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TooltipButton from '@/components/ui/tooltip-button';

interface ResidentActionsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  onAddSuccess: (newOwner: any) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

const ResidentActions: React.FC<ResidentActionsProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  onAddSuccess,
  onExportCSV,
  onExportPDF
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <TooltipButton variant="outline" tooltip="Export resident data">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TooltipButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExportCSV}>Export Owners CSV</DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPDF}>Export Owners PDF</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <TooltipButton 
        variant="outline" 
        onClick={() => navigate('/system/data-management')} 
        tooltip="Go to data management page"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import/Export
      </TooltipButton>
      
      <TooltipButton 
        onClick={() => setIsAddDialogOpen(true)}
        tooltip="Add a new resident"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Owner
      </TooltipButton>
      
      <ResidentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        resident={null}
      />
    </div>
  );
};

export default ResidentActions;
