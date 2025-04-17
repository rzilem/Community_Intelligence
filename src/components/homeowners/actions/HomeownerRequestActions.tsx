
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Plus, Bug } from 'lucide-react';
import HomeownerRequestsColumnSelector from '@/components/homeowners/HomeownerRequestsColumnSelector';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';

interface HomeownerRequestActionsProps {
  isLoading: boolean;
  showDebugInfo: boolean;
  onRefresh: () => void;
  onNewRequest: () => void;
  onToggleDebug: () => void;
  onCreateTest: () => void;
  columns: HomeownerRequestColumn[];
  selectedColumns: string[];
  onColumnChange: (columns: string[]) => void;
  onColumnReorder: (sourceIndex: number, destinationIndex: number) => void;
  onColumnReset: () => void;
}

const HomeownerRequestActions: React.FC<HomeownerRequestActionsProps> = ({
  isLoading,
  showDebugInfo,
  onRefresh,
  onNewRequest,
  onToggleDebug,
  onCreateTest,
  columns,
  selectedColumns,
  onColumnChange,
  onColumnReorder,
  onColumnReset
}) => {
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
        Refresh
      </Button>
      <Button onClick={onNewRequest}>
        <Plus className="h-4 w-4 mr-2" /> New Request
      </Button>
      <HomeownerRequestsColumnSelector
        columns={columns}
        selectedColumns={selectedColumns}
        onChange={onColumnChange}
        onReorder={onColumnReorder}
        onResetDefault={onColumnReset}
      />
      <Button variant="outline" onClick={onToggleDebug}>
        <Bug className="h-4 w-4 mr-2" /> {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
      </Button>
      <Button variant="outline" onClick={onCreateTest}>
        Create Test Request
      </Button>
    </div>
  );
};

export default HomeownerRequestActions;
