
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { HomeownerRequest } from '@/types/homeowner-request-types';

interface RequestActionsProps {
  request: HomeownerRequest;
  onViewRequest: (request: HomeownerRequest) => void;
  onEditRequest: (request: HomeownerRequest) => void;
}

export const RequestActions: React.FC<RequestActionsProps> = ({
  request,
  onViewRequest,
  onEditRequest,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onViewRequest(request)}
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onEditRequest(request)}
        title="Edit request"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};
