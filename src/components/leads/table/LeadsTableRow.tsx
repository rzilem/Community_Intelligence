
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TableCell, TableRow } from '@/components/ui/table';
import { Lead } from '@/types/lead-types';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import { renderLeadTableCell } from '../lead-table-utils';
import LeadsTableActions from './LeadsTableActions';

interface LeadsTableRowProps {
  lead: Lead;
  columns: LeadColumn[];
  visibleColumnIds: string[];
  onViewDetails: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: Lead['status']) => void;
}

const LeadsTableRow: React.FC<LeadsTableRowProps> = ({
  lead,
  columns,
  visibleColumnIds,
  onViewDetails,
  onEditLead,
  onDeleteLead,
  onUpdateLeadStatus
}) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/lead-management/leads/${lead.id}`);
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleRowClick}
    >
      {visibleColumnIds.map(columnId => (
        <TableCell key={`${lead.id}-${columnId}`}>
          {renderLeadTableCell(lead, columnId, columns)}
        </TableCell>
      ))}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <LeadsTableActions
          lead={lead}
          onViewDetails={onViewDetails}
          onEditLead={onEditLead}
          onDeleteLead={onDeleteLead}
          onUpdateLeadStatus={onUpdateLeadStatus}
        />
      </TableCell>
    </TableRow>
  );
};

export default LeadsTableRow;
