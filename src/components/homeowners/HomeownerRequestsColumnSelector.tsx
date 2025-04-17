
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
  console.log("HomeownerRequestsColumnSelector rendering with", columns.length, "columns");
  
  // Filter out null values from selectedColumns
  const validSelectedColumns = selectedColumns.filter(column => column !== null);
  console.log("Valid selected columns:", validSelectedColumns);
  
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
