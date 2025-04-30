
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';

interface HomeownerRequestDebugInfoProps {
  requests: HomeownerRequest[];
  filteredRequests: HomeownerRequest[];
}

const HomeownerRequestDebugInfo = ({ 
  requests,
  filteredRequests 
}: HomeownerRequestDebugInfoProps) => {
  return (
    <div className="mt-8 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Total Requests: {requests.length}</p>
        <p>Filtered Requests: {filteredRequests.length}</p>
      </div>
    </div>
  );
};

export default HomeownerRequestDebugInfo;
