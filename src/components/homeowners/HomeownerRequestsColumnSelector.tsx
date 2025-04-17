
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
  return (
    <ColumnSelector
      columns={columns}
      selectedColumns={selectedColumns}
      onChange={onChange}
      onReorder={onReorder}
      resetToDefaults={onResetDefault}
      className={className}
    />
  );
};

export default HomeownerRequestsColumnSelector;
