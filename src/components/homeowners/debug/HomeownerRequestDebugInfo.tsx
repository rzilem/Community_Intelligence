
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Association } from '@/types/association-types';
import { HomeownerRequest } from '@/types/homeowner-request-types';

interface HomeownerRequestDebugInfoProps {
  currentAssociation: Association | null;
  totalRequests: number;
  filteredRequests: number;
  activeTab: string;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date;
  visibleColumns: string[];
}

const HomeownerRequestDebugInfo: React.FC<HomeownerRequestDebugInfoProps> = ({
  currentAssociation,
  totalRequests,
  filteredRequests,
  activeTab,
  isLoading,
  error,
  lastRefreshed,
  visibleColumns
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <div className="text-sm space-y-1">
          <p><strong>Current Association:</strong> {currentAssociation?.id || 'None selected'}</p>
          <p><strong>Association Name:</strong> {currentAssociation?.name || 'N/A'}</p>
          <p><strong>Total Requests (unfiltered):</strong> {totalRequests}</p>
          <p><strong>Filtered Requests:</strong> {filteredRequests}</p>
          <p><strong>Active Tab:</strong> {activeTab}</p>
          <p><strong>Loading State:</strong> {isLoading ? 'Loading...' : 'Loaded'}</p>
          <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
          <p><strong>Last Refreshed:</strong> {lastRefreshed.toLocaleString()}</p>
          <p><strong>Visible Columns:</strong> {visibleColumns.join(', ')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeownerRequestDebugInfo;
