
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Tags, Trash2 } from 'lucide-react';

interface VendorBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAddSpecialties: () => void;
  onDeleteVendors?: () => void;
}

const VendorBulkActions: React.FC<VendorBulkActionsProps> = ({
  selectedCount,
  onClearSelection,
  onAddSpecialties,
  onDeleteVendors
}) => {
  if (selectedCount === 0) return null;

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} vendor{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-700 border-blue-300"
          >
            <X className="mr-1 h-3 w-3" />
            Clear Selection
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSpecialties}
            className="text-blue-700 border-blue-300"
          >
            <Tags className="mr-2 h-4 w-4" />
            Add Specialties
          </Button>
          {onDeleteVendors && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteVendors}
              className="text-red-700 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VendorBulkActions;
