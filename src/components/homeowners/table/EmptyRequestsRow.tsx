
import React from 'react';
import { InboxIcon } from 'lucide-react';

interface EmptyRequestsRowProps {
  message?: string;
}

export const EmptyRequestsRow: React.FC<EmptyRequestsRowProps> = ({ 
  message = 'No requests found'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 p-4 rounded-full mb-4">
        <InboxIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        No matching requests were found. Try adjusting your filters or creating a new request.
      </p>
    </div>
  );
};

export default EmptyRequestsRow;
