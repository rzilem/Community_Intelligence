
import React from 'react';
import { Table, TableHeader, TableBody } from '@/components/ui/table';
import { Lead } from '@/types/lead-types';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import ColumnSelector from '@/components/table/ColumnSelector';
import LeadsTableRow from './LeadsTableRow';
import LeadsTableHeader from './LeadsTableHeader';

interface LeadsTableLayoutProps {
  leads: Lead[];
  isLoading: boolean;
  columns: LeadColumn[];
  visibleColumnIds: string[];
  onUpdateVisibleColumns?: (columnIds: string[]) => void;
  onReorderColumns?: (startIndex: number, endIndex: number) => void;
  onViewDetails: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: Lead['status']) => void;
}

const LeadsTableLayout: React.FC<LeadsTableLayoutProps> = ({
  leads,
  isLoading,
  columns,
  visibleColumnIds,
  onUpdateVisibleColumns,
  onReorderColumns,
  onViewDetails,
  onEditLead,
  onDeleteLead,
  onUpdateLeadStatus
}) => {
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading leads...</div>;
  }

  return (
    <div>
      {onUpdateVisibleColumns && (
        <div className="flex justify-end mb-4">
          <ColumnSelector 
            columns={columns} 
            selectedColumns={visibleColumnIds} 
            onChange={onUpdateVisibleColumns} 
            onReorder={onReorderColumns}
          />
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <LeadsTableHeader columns={columns} visibleColumnIds={visibleColumnIds} />
          <TableBody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnIds.length + 1} className="text-center py-8 text-muted-foreground">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map(lead => (
                <LeadsTableRow
                  key={lead.id}
                  lead={lead}
                  columns={columns}
                  visibleColumnIds={visibleColumnIds}
                  onViewDetails={onViewDetails}
                  onEditLead={onEditLead}
                  onDeleteLead={onDeleteLead}
                  onUpdateLeadStatus={onUpdateLeadStatus}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadsTableLayout;
