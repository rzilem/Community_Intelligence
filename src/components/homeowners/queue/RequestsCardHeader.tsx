
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import HomeownerRequestsColumnSelector from '@/components/homeowners/HomeownerRequestsColumnSelector';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';

interface RequestsCardHeaderProps {
  visibleColumnIds: string[];
  columns: HomeownerRequestColumn[];
  onColumnChange: (columnIds: string[]) => void;
  onReorderColumns: (sourceIndex: number, destinationIndex: number) => void;
  onResetColumns?: () => void; 
}

const RequestsCardHeader: React.FC<RequestsCardHeaderProps> = ({
  visibleColumnIds,
  columns,
  onColumnChange,
  onReorderColumns,
  onResetColumns
}) => {
  console.log("RequestsCardHeader rendering with columns:", columns.length);
  console.log("Visible column IDs:", visibleColumnIds);
  
  return (
    <div className="flex justify-between items-center">
      <CardTitle>Request Queue</CardTitle>
      <div className="flex items-center">
        <HomeownerRequestsColumnSelector
          columns={columns}
          selectedColumns={visibleColumnIds}
          onChange={onColumnChange}
          onReorder={onReorderColumns}
          onResetDefault={onResetColumns}
        />
      </div>
    </div>
  );
};

export default RequestsCardHeader;
