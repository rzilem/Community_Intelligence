
import React from 'react';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { useResidentFromEmail } from '@/hooks/homeowners/useResidentFromEmail';
import { RequestActions } from './RequestActions';
import { RequestTableCell } from './RequestTableCell';
import { RequestQueueView } from './RequestQueueView';
import { extractPrimarySenderEmail } from '../utils/extractEmailUtils';

export interface RequestTableRowProps {
  request: HomeownerRequest;
  columns: HomeownerRequestColumn[];
  visibleColumnIds?: string[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onViewRequest?: (request: HomeownerRequest) => void;
  onEditRequest?: (request: HomeownerRequest) => void;
  onViewDetails?: () => void;
  onViewHistory?: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

export const RequestTableRow: React.FC<RequestTableRowProps> = ({
  request,
  columns,
  visibleColumnIds,
  isSelected,
  onToggleSelect,
  onViewRequest,
  onEditRequest,
  onViewDetails,
  onViewHistory,
  onStatusChange,
}) => {
  const senderEmail = extractPrimarySenderEmail(request.html_content, request.tracking_number);
  
  const { data: association } = useSupabaseQuery(
    'associations',
    {
      select: 'name',
      filter: [{ column: 'id', value: request.association_id }],
      single: true
    },
    !!request.association_id
  );

  const { resident, property } = useResidentFromEmail(
    request.html_content,
    senderEmail
  );

  React.useEffect(() => {
    const shouldUpdateRequest = (
      resident && 
      property && 
      (!request.resident_id || !request.property_id || !request.association_id)
    );
    
    if (shouldUpdateRequest && onEditRequest) {
      console.log('Resident info found that could update request:', {
        resident_id: resident.id,
        property_id: property.id,
        association_id: property.association_id
      });
    }
  }, [resident, property, request, onEditRequest]);

  if (!visibleColumnIds) {
    return (
      <RequestQueueView
        request={request}
        resident={resident}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onViewDetails={onViewDetails}
        onViewHistory={onViewHistory}
        onStatusChange={onStatusChange}
      />
    );
  }

  return (
    <tr className="hover:bg-muted/50">
      {visibleColumnIds.map((columnId) => (
        <td 
          key={columnId} 
          className="py-2 px-4 last:border-r-0"
        >
          <RequestTableCell
            columnId={columnId}
            request={request}
            resident={resident}
            property={property}
            association={association}
            email={senderEmail}
          />
        </td>
      ))}
      <td className="py-2 px-4 text-center border-l border-border/20">
        <RequestActions 
          request={request}
          onViewRequest={onViewRequest ? () => onViewRequest(request) : undefined}
          onEditRequest={onEditRequest ? () => onEditRequest(request) : undefined}
          onViewDetails={onViewDetails}
          onViewHistory={onViewHistory}
          onStatusChange={onStatusChange}
        />
      </td>
    </tr>
  );
};

export default RequestTableRow;
