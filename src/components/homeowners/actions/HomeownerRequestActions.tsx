
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Bug, LayoutList } from 'lucide-react';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';
import HomeownerRequestsColumnSelector from '@/components/homeowners/HomeownerRequestsColumnSelector';

interface HomeownerRequestActionsProps {
  isLoading: boolean;
  showDebugInfo: boolean;
  onRefresh: () => void;
  onNewRequest: () => void;
  onToggleDebug: () => void;
  onCreateTest?: () => void;
  columns: HomeownerRequestColumn[];
  selectedColumns: string[];
  onColumnChange: (columns: string[]) => void;
  onColumnReorder?: (sourceIndex: number, destinationIndex: number) => void;
  onColumnReset?: () => void;
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
  onColumnReset,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onNewRequest}>
        <PlusCircle className="h-4 w-4 mr-2" />
        New Request
      </Button>
      
      <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      {onCreateTest && (
        <Button variant="outline" onClick={onCreateTest}>
          <Bug className="h-4 w-4 mr-2" />
          Test Data
        </Button>
      )}
      
      <Button 
        variant={showDebugInfo ? "default" : "outline"}
        onClick={onToggleDebug}
      >
        <LayoutList className="h-4 w-4 mr-2" />
        {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
      </Button>
      
      <HomeownerRequestsColumnSelector
        columns={columns}
        selectedColumns={selectedColumns}
        onChange={onColumnChange}
        onReorder={onColumnReorder}
        onResetDefault={onColumnReset}
      />
    </div>
  );
};

export default HomeownerRequestActions;
