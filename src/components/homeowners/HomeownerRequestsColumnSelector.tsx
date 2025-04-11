
import React from 'react';
import { Button } from '@/components/ui/button';
import { Columns } from 'lucide-react';
import ColumnSelector from '@/components/table/ColumnSelector';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';

interface HomeownerRequestsColumnSelectorProps {
  columns: HomeownerRequestColumn[];
  selectedColumns: string[];
  onChange: (selectedColumns: string[]) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
}

const HomeownerRequestsColumnSelector: React.FC<HomeownerRequestsColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  onReorder
}) => {
  return (
    <ColumnSelector
      columns={columns}
      selectedColumns={selectedColumns}
      onChange={onChange}
      onReorder={onReorder}
      className="ml-2"
    />
  );
};

export default HomeownerRequestsColumnSelector;
