
import React from 'react';

interface RequestsStatusFooterProps {
  filteredCount: number;
  totalCount: number;
  lastRefreshed: Date;
}

const RequestsStatusFooter: React.FC<RequestsStatusFooterProps> = ({ 
  filteredCount, 
  totalCount, 
  lastRefreshed 
}) => {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <p>
        Showing {filteredCount} of {totalCount} requests
      </p>
      <p>
        Last updated: {lastRefreshed.toLocaleString()}
      </p>
    </div>
  );
};

export default RequestsStatusFooter;
