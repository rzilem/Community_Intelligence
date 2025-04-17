
import React from 'react';
import HomeownerRequestActions from '@/components/homeowners/actions/HomeownerRequestActions';
import { HOMEOWNER_REQUEST_COLUMNS } from '@/types/homeowner-request-types';
import { useUserColumns } from '@/hooks/useUserColumns';

interface HomeownerRequestHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onCreateTest?: () => void;
}

const HomeownerRequestHeader = ({
  isLoading,
  onRefresh,
  onCreateTest
}: HomeownerRequestHeaderProps) => {
  const [showDebugInfo, setShowDebugInfo] = React.useState(true);
  const { 
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults 
  } = useUserColumns(HOMEOWNER_REQUEST_COLUMNS, 'homeowner-requests');

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">Homeowner Requests</h1>
        <p className="text-muted-foreground">
          Manage and respond to homeowner requests
        </p>
      </div>
      <HomeownerRequestActions
        isLoading={isLoading}
        showDebugInfo={showDebugInfo}
        onRefresh={onRefresh}
        onNewRequest={() => {}} // Will be implemented in the dialog component
        onToggleDebug={() => setShowDebugInfo(!showDebugInfo)}
        onCreateTest={onCreateTest}
        columns={HOMEOWNER_REQUEST_COLUMNS}
        selectedColumns={visibleColumnIds}
        onColumnChange={updateVisibleColumns}
        onColumnReorder={reorderColumns}
        onColumnReset={resetToDefaults}
      />
    </div>
  );
};

export default HomeownerRequestHeader;
