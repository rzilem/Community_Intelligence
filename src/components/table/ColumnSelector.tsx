
import React, { useState, useEffect } from 'react';
import { Columns, GripVertical } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Column {
  id: string;
  label: string;
  defaultVisible?: boolean;
}

interface ColumnSelectorProps {
  columns: Column[];
  selectedColumns: string[];
  onChange: (selectedColumns: string[]) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
  resetToDefaults?: () => void;
  className?: string;
  storageKey?: string;
}

const getStorageKey = (key?: string) => key ?? "column_selector_default";

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  onReorder,
  resetToDefaults,
  className,
  storageKey = "column_selector_default"
}) => {
  const [open, setOpen] = useState(false);
  const [localColumns, setLocalColumns] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize with selected columns whenever they change
  useEffect(() => {
    console.log('ColumnSelector received selectedColumns:', selectedColumns);
    if (selectedColumns && selectedColumns.length > 0) {
      setLocalColumns(selectedColumns);
    } else {
      // If no selected columns, use defaults from the columns prop
      const defaultCols = columns.filter(c => c.defaultVisible !== false).map(c => c.id);
      setLocalColumns(defaultCols);
    }
  }, [selectedColumns, columns]);

  const handleColumnToggle = (columnId: string) => {
    let updatedColumns;
    if (localColumns.includes(columnId)) {
      // Prevent removing the last column
      if (localColumns.length === 1) {
        toast.warning("At least one column must remain visible");
        return;
      }
      updatedColumns = localColumns.filter(id => id !== columnId);
    } else {
      updatedColumns = [...localColumns, columnId];
    }
    
    console.log('Column toggle - updated columns:', updatedColumns);
    setLocalColumns(updatedColumns);
    onChange(updatedColumns);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || !onReorder) return;
    if (draggedIndex !== index) {
      const newOrder = [...localColumns];
      const [removed] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(index, 0, removed);
      setLocalColumns(newOrder);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && onReorder) {
      onReorder(draggedIndex, draggedIndex);
      onChange(localColumns);
    }
    setDraggedIndex(null);
  };

  const handleResetToDefaults = () => {
    if (resetToDefaults) {
      resetToDefaults();
      setOpen(false);
      toast.success("Column settings reset to defaults");
    }
  };

  // Get selected and unselected columns for display
  const selectedColumnObjects = columns
    .filter(col => localColumns.includes(col.id))
    .sort((a, b) => localColumns.indexOf(a.id) - localColumns.indexOf(b.id));

  const unselectedColumnObjects = columns
    .filter(col => !localColumns.includes(col.id));

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
          {selectedColumnObjects.map((column, index) => (
            <div 
              key={column.id}
              draggable={!!onReorder}
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
            >
              {onReorder && (
                <div className="cursor-grab">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <Checkbox 
                checked={localColumns.includes(column.id)}
                onCheckedChange={() => handleColumnToggle(column.id)}
                id={`column-${column.id}`}
              />
              <label 
                htmlFor={`column-${column.id}`}
                className="text-sm leading-none flex-1 cursor-pointer"
              >
                {column.label}
              </label>
            </div>
          ))}
        </div>
        {unselectedColumnObjects.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-muted-foreground mb-2">Available Columns</p>
            <div className="space-y-1 max-h-[150px] overflow-auto">
              {unselectedColumnObjects.map(column => (
                <div 
                  key={column.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                >
                  <Checkbox 
                    checked={false}
                    onCheckedChange={() => handleColumnToggle(column.id)}
                    id={`column-${column.id}`}
                  />
                  <label 
                    htmlFor={`column-${column.id}`}
                    className="text-sm leading-none flex-1 cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        {resetToDefaults && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 w-full"
            onClick={handleResetToDefaults}
          >
            Reset to Defaults
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ColumnSelector;
