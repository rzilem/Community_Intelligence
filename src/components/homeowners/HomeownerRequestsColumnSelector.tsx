
import React from 'react';
import ColumnSelector from '@/components/table/ColumnSelector';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';

interface HomeownerRequestsColumnSelectorProps {
  columns: HomeownerRequestColumn[];
  selectedColumns: string[];
  onChange: (selectedColumns: string[]) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
  onResetDefault?: () => void;
  className?: string;
}

const HomeownerRequestsColumnSelector: React.FC<HomeownerRequestsColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  onReorder,
  onResetDefault,
  className = "ml-2"
}) => {
  // Filter out invalid column IDs
  const validSelectedColumns = selectedColumns.filter(
    columnId => columns.some(col => col.id === columnId)
  );
  
  return (
    <ColumnSelector
      columns={columns}
      selectedColumns={validSelectedColumns}
      onChange={onChange}
      onReorder={onReorder}
      resetToDefaults={onResetDefault}
      className={className}
    />
  );
};

export default HomeownerRequestsColumnSelector;
