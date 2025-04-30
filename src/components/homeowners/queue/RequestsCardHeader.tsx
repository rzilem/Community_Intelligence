
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
  
  // Filter out null values from visibleColumnIds
  const validVisibleColumnIds = visibleColumnIds.filter(id => id !== null);
  console.log("Valid visible column IDs:", validVisibleColumnIds);
  
  const handleColumnChange = (newColumnIds: string[]) => {
    console.log("Column change in RequestsCardHeader:", newColumnIds);
    onColumnChange(newColumnIds);
  };
  
  return (
    <div className="flex justify-between items-center">
      <CardTitle>Request Queue</CardTitle>
      <div className="flex items-center">
        <HomeownerRequestsColumnSelector
          columns={columns}
          selectedColumns={validVisibleColumnIds}
          onChange={handleColumnChange}
          onReorder={onReorderColumns}
          onResetDefault={onResetColumns}
        />
      </div>
    </div>
  );
};

export default RequestsCardHeader;
