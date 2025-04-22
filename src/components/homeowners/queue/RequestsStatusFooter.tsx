
import React from 'react';

export interface RequestsStatusFooterProps {
  status: string;
  count: number;
}

export const RequestsStatusFooter: React.FC<RequestsStatusFooterProps> = ({
  status,
  count
}) => {
  return (
    <div className="px-4 py-2 border-t bg-muted/30 text-sm flex justify-between items-center">
      <span className="text-muted-foreground">
        Showing {count} {status !== 'all' ? status : ''} {count === 1 ? 'request' : 'requests'}
      </span>
    </div>
  );
};

export default RequestsStatusFooter;
