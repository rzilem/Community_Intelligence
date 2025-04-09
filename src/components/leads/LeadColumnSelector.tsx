
import React from 'react';
import { Columns, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { LeadColumn } from '@/hooks/leads/useTableColumns';

interface LeadColumnSelectorProps {
  columns: LeadColumn[];
  selectedColumns: string[];
  onChange: (selectedColumns: string[]) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
  resetToDefaults?: () => void;
  className?: string;
}

const LeadColumnSelector: React.FC<LeadColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  onReorder,
  resetToDefaults,
  className
}) => {
  const [open, setOpen] = React.useState(false);
  const [localSelectedColumns, setLocalSelectedColumns] = React.useState<string[]>(selectedColumns || []);
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);

  // Update local state when selectedColumns prop changes
  React.useEffect(() => {
    setLocalSelectedColumns(selectedColumns || []);
  }, [selectedColumns]);

  const handleColumnToggle = (columnId: string) => {
    const updatedColumns = localSelectedColumns.includes(columnId)
      ? localSelectedColumns.filter(id => id !== columnId)
      : [...localSelectedColumns, columnId];

    // Ensure at least one column is selected
    if (updatedColumns.length === 0) {
      return;
    }

    setLocalSelectedColumns(updatedColumns);
    onChange(updatedColumns);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItem === null || !onReorder) return;
    
    const draggedOverItem = index;
    
    if (draggedItem === draggedOverItem) return;
    
    onReorder(draggedItem, draggedOverItem);
    setDraggedItem(draggedOverItem);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <Columns className="h-4 w-4 mr-2" />
          Customize Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <h3 className="font-medium mb-2">Display Columns</h3>
        <p className="text-xs text-muted-foreground mb-2">
          {onReorder ? "Drag to reorder columns" : "Select columns to display"}
        </p>
        <div className="space-y-1 max-h-[300px] overflow-auto">
          {columns.map((column, index) => (
            <div 
              key={column.id} 
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-move"
              draggable={onReorder !== undefined}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {onReorder && (
                <div className="flex items-center justify-center">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <Checkbox 
                id={`column-${column.id}`}
                checked={localSelectedColumns.includes(column.id)}
                onCheckedChange={() => handleColumnToggle(column.id)}
              />
              <label 
                htmlFor={`column-${column.id}`}
                className="text-sm leading-none flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {column.label}
              </label>
            </div>
          ))}
        </div>
        {resetToDefaults && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-4">
          At least one column must be selected
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LeadColumnSelector;
