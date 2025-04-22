
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Clock, MoreHorizontal } from 'lucide-react';
import { HomeownerRequest } from '@/types/homeowner-request-types';

interface RequestActionsProps {
  request: HomeownerRequest;
  onViewRequest?: (request: HomeownerRequest) => void;
  onEditRequest?: (request: HomeownerRequest) => void;
  onViewDetails?: () => void;
  onViewHistory?: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

export const RequestActions: React.FC<RequestActionsProps> = ({
  request,
  onViewRequest,
  onEditRequest,
  onViewDetails,
  onViewHistory,
  onStatusChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {onViewRequest && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onViewRequest(request)}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      
      {onEditRequest && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onEditRequest(request)}
          title="Edit request"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {onViewDetails && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onViewDetails}
          title="View full details"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )}
      
      {onViewHistory && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onViewHistory}
          title="View history"
        >
          <Clock className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default RequestActions;
