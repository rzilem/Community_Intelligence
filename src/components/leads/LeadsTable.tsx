
import React from 'react';
import { Lead } from '@/types/lead-types';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import { useLeadsTable } from '@/hooks/leads/useLeadsTable';
import LeadDetailDialog from './LeadDetailDialog';
import LeadTablePagination from './LeadTablePagination';
import LeadsTableLayout from './table/LeadsTableLayout';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  columns: LeadColumn[];
  visibleColumnIds: string[];
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: Lead['status']) => void;
  onUpdateVisibleColumns?: (columnIds: string[]) => void;
  onReorderColumns?: (startIndex: number, endIndex: number) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  isLoading,
  columns,
  visibleColumnIds,
  onDeleteLead,
  onUpdateLeadStatus,
  onUpdateVisibleColumns,
  onReorderColumns
}) => {
  const {
    selectedLead,
    isDetailOpen,
    setIsDetailOpen,
    handleViewDetails,
    handleDeleteLead,
    handleUpdateStatus
  } = useLeadsTable({ onDeleteLead, onUpdateLeadStatus });

  return (
    <div>
      <LeadsTableLayout
        leads={leads}
        isLoading={isLoading}
        columns={columns}
        visibleColumnIds={visibleColumnIds}
        onUpdateVisibleColumns={onUpdateVisibleColumns}
        onReorderColumns={onReorderColumns}
        onViewDetails={handleViewDetails}
        onEditLead={(lead) => console.log('Edit lead:', lead)}
        onDeleteLead={handleDeleteLead}
        onUpdateLeadStatus={handleUpdateStatus}
      />
      
      {leads.length > 0 && (
        <div className="border-t p-2 flex justify-center">
          <LeadTablePagination totalPages={5} currentPage={1} onPageChange={() => {}} />
        </div>
      )}
      
      <LeadDetailDialog lead={selectedLead} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
    </div>
  );
};

export default LeadsTable;
