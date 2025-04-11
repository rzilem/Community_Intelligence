
import React from 'react';
import { PlusCircle, Filter, RefreshCw, MoreHorizontal, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddAssociationDialog } from '@/components/associations/AddAssociationDialog';
import { AssociationFormData } from '@/components/associations/AssociationForm';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface AssociationToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isCreating: boolean;
  onSaveAssociation: (data: AssociationFormData) => void;
  onSelectAll?: () => void;
  selectedCount?: number;
  totalCount?: number;
}

const AssociationToolbar: React.FC<AssociationToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isLoading,
  isCreating,
  onSaveAssociation,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleAddAssociation = (data: AssociationFormData) => {
    onSaveAssociation(data);
    setDialogOpen(false);
  };

  const handleExport = () => {
    toast.info("Export functionality will be implemented soon");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSelectAll && (
        <div className="flex items-center gap-2 mr-2">
          <Checkbox
            id="select-all"
            checked={selectedCount > 0 && selectedCount === totalCount}
            onCheckedChange={onSelectAll}
            aria-label="Select all associations"
          />
          <label
            htmlFor="select-all"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            {selectedCount > 0 ? `${selectedCount}/${totalCount}` : "Select all"}
          </label>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Association
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Association</DialogTitle>
          </DialogHeader>
          <AddAssociationDialog 
            onSave={handleAddAssociation} 
            isCreating={isCreating}
          />
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport}>
            Export Associations
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSearchChange('')}>
            Clear filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AssociationToolbar;
