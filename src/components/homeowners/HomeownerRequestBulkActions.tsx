
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';

interface HomeownerRequestBulkActionsProps {
  selectedRequestIds: string[];
  onClearSelection: () => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkAssign?: (ids: string[]) => void;
  onBulkStatusChange?: (ids: string[], status: string) => void;
}

const HomeownerRequestBulkActions: React.FC<HomeownerRequestBulkActionsProps> = ({
  selectedRequestIds,
  onClearSelection,
  onBulkDelete,
  onBulkAssign,
  onBulkStatusChange
}) => {
  if (selectedRequestIds.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onClearSelection}
      >
        Clear Selection
      </Button>
      
      {onBulkStatusChange && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkStatusChange(selectedRequestIds, 'in-progress')}
            className="gap-1"
          >
            <Clock className="h-4 w-4" />
            Mark In Progress
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkStatusChange(selectedRequestIds, 'resolved')}
            className="gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            Mark Resolved
          </Button>
        </>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
            More Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onBulkAssign && (
            <DropdownMenuItem onClick={() => onBulkAssign(selectedRequestIds)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign to...
            </DropdownMenuItem>
          )}
          
          {onBulkStatusChange && (
            <>
              <DropdownMenuItem onClick={() => onBulkStatusChange(selectedRequestIds, 'open')}>
                <Clock className="h-4 w-4 mr-2" />
                Mark as Open
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onBulkStatusChange(selectedRequestIds, 'closed')}>
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Closed
              </DropdownMenuItem>
            </>
          )}
          
          {onBulkDelete && (
            <DropdownMenuItem 
              onClick={() => onBulkDelete(selectedRequestIds)}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HomeownerRequestBulkActions;
