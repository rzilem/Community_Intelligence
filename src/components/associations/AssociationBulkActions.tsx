
import React from 'react';
import { Trash2, ArchiveRestore, Archive, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Association } from '@/types/association-types';

interface AssociationBulkActionsProps {
  selectedAssociations: Association[];
  onArchive: (ids: string[]) => void;
  onRestore: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onClearSelection: () => void;
  isLoading: boolean;
}

export default function AssociationBulkActions({
  selectedAssociations,
  onArchive,
  onRestore,
  onDelete,
  onClearSelection,
  isLoading
}: AssociationBulkActionsProps) {
  if (selectedAssociations.length === 0) {
    return null;
  }

  const activeCount = selectedAssociations.filter(a => !a.is_archived).length;
  const inactiveCount = selectedAssociations.filter(a => a.is_archived).length;

  const handleArchive = () => {
    const ids = selectedAssociations.filter(a => !a.is_archived).map(a => a.id);
    if (ids.length === 0) {
      toast.warning('No active associations selected');
      return;
    }
    onArchive(ids);
  };

  const handleRestore = () => {
    const ids = selectedAssociations.filter(a => a.is_archived).map(a => a.id);
    if (ids.length === 0) {
      toast.warning('No archived associations selected');
      return;
    }
    onRestore(ids);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete ${selectedAssociations.length} association(s)? This action cannot be undone.`)) {
      onDelete(selectedAssociations.map(a => a.id));
    }
  };

  return (
    <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-md animate-fade-in">
      <span className="text-sm font-medium">
        {selectedAssociations.length} selected
      </span>
      
      <div className="flex-1" />
      
      {activeCount > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleArchive}
          disabled={isLoading}
          className="gap-1"
        >
          <Archive className="h-4 w-4" />
          Archive {activeCount > 1 ? `(${activeCount})` : ''}
        </Button>
      )}
      
      {inactiveCount > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRestore}
          disabled={isLoading}
          className="gap-1"
        >
          <ArchiveRestore className="h-4 w-4" />
          Restore {inactiveCount > 1 ? `(${inactiveCount})` : ''}
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete selected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onClearSelection}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear selection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
