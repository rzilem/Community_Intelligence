
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
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Export Owners CSV</DropdownMenuItem>
          <DropdownMenuItem>Export Owners PDF</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="outline" onClick={() => navigate('/system/data-import-export')}>
        <Upload className="h-4 w-4 mr-2" />
        Import/Export
      </Button>
      
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Owner
      </Button>
      
      <ResidentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        resident={null}
      />
    </div>
  );
};

export default ResidentActions;
