
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';

interface ColumnSettingsProps {
  columns: Array<{
    id: string;
    label: string;
  }>;
  visibleColumnIds: string[];
  onColumnChange: (selectedColumns: string[]) => void;
  onReset: () => void;
}

export const ColumnSettings: React.FC<ColumnSettingsProps> = ({
  columns,
  visibleColumnIds,
  onColumnChange,
  onReset,
}) => {
  const handleColumnToggle = (columnId: string, checked: boolean) => {
    if (checked) {
      onColumnChange([...visibleColumnIds, columnId]);
    } else {
      onColumnChange(visibleColumnIds.filter(id => id !== columnId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Column Display</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="flex items-center gap-1 text-xs"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-2">
        {columns.map((column) => (
          <div key={column.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`column-${column.id}`}
              checked={visibleColumnIds.includes(column.id)}
              onCheckedChange={(checked) => 
                handleColumnToggle(column.id, checked as boolean)
              }
            />
            <Label 
              htmlFor={`column-${column.id}`}
              className="text-sm font-normal"
            >
              {column.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
