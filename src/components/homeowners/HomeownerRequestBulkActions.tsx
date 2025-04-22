
import React, { useState } from 'react';
import { CheckSquare, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';

interface HomeownerRequestBulkActionsProps {
  selectedRequests: HomeownerRequest[];
  onBulkStatusChange: (status: string, requestIds: string[]) => Promise<void>;
  onBulkPriorityChange: (priority: string, requestIds: string[]) => Promise<void>;
  onBulkAssign: (userId: string, requestIds: string[]) => Promise<void>;
  onSelectionClear: () => void;
}

const HomeownerRequestBulkActions: React.FC<HomeownerRequestBulkActionsProps> = ({
  selectedRequests,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkAssign,
  onSelectionClear
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'status' | 'priority' | 'assign'>('status');
  const [selectedValue, setSelectedValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = (type: 'status' | 'priority' | 'assign') => {
    setDialogType(type);
    setSelectedValue('');
    setDialogOpen(true);
  };

  const handleApply = async () => {
    if (!selectedValue) {
      toast.error('Please select a value');
      return;
    }

    setIsProcessing(true);
    try {
      const requestIds = selectedRequests.map(req => req.id);
      
      if (dialogType === 'status') {
        await onBulkStatusChange(selectedValue, requestIds);
        toast.success(`Status updated for ${requestIds.length} requests`);
      } else if (dialogType === 'priority') {
        await onBulkPriorityChange(selectedValue, requestIds);
        toast.success(`Priority updated for ${requestIds.length} requests`);
      } else if (dialogType === 'assign') {
        await onBulkAssign(selectedValue, requestIds);
        toast.success(`${requestIds.length} requests have been assigned`);
      }
      
      setDialogOpen(false);
      onSelectionClear();
    } catch (error) {
      console.error('Error applying bulk action:', error);
      toast.error('Failed to apply bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedRequests.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
        <CheckSquare className="h-4 w-4" />
        <span className="text-sm">{selectedRequests.length} requests selected</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-1" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAction('status')}>
              Change Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('priority')}>
              Change Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('assign')}>
              Assign To
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" size="sm" onClick={onSelectionClear}>
          Clear Selection
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'status' && 'Change Status for Selected Requests'}
              {dialogType === 'priority' && 'Change Priority for Selected Requests'}
              {dialogType === 'assign' && 'Assign Selected Requests'}
            </DialogTitle>
            <DialogDescription>
              This action will affect {selectedRequests.length} selected requests.
            </DialogDescription>
          </DialogHeader>

          {dialogType === 'status' && (
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          )}

          {dialogType === 'priority' && (
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select new priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          )}

          {dialogType === 'assign' && (
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select user to assign" />
              </SelectTrigger>
              <SelectContent>
                {/* This would be populated with users from your system */}
                <SelectItem value="user-1">John Doe</SelectItem>
                <SelectItem value="user-2">Jane Smith</SelectItem>
                <SelectItem value="user-3">Bob Johnson</SelectItem>
              </SelectContent>
            </Select>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomeownerRequestBulkActions;
