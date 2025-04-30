
import React from 'react';
import { Button } from '@/components/ui/button';
import { Columns } from 'lucide-react';
import ColumnSelector from '@/components/table/ColumnSelector';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';
import TooltipButton from '@/components/ui/tooltip-button';

interface HomeownerRequestsColumnSelectorProps {
  columns: HomeownerRequestColumn[];
  selectedColumns: string[];
  onChange: (selectedColumns: string[]) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
  onResetDefault?: () => void;
}

const HomeownerRequestsColumnSelector: React.FC<HomeownerRequestsColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  onReorder,
  onResetDefault
}) => {
  return (
    <ColumnSelector
      columns={columns}
      selectedColumns={selectedColumns}
      onChange={onChange}
      onReorder={onReorder}
      resetToDefaults={onResetDefault}
      className="ml-2"
    />
  );
};

export default HomeownerRequestsColumnSelector;
