
import React from 'react';
import LeadsTable from '@/components/leads/LeadsTable';
import { Lead } from '@/types/lead-types';

interface LeadsContentProps {
  leads: Lead[];
  isLoading: boolean;
  visibleColumnIds: string[];
  columns: any[];
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: Lead['status']) => void;
}

const LeadsContent: React.FC<LeadsContentProps> = ({
  leads,
  isLoading,
  visibleColumnIds,
  columns,
  onDeleteLead,
  onUpdateLeadStatus
}) => {
  return (
    <LeadsTable 
      leads={leads} 
      isLoading={isLoading}
      visibleColumnIds={visibleColumnIds}
      columns={columns}
      onDeleteLead={onDeleteLead}
      onUpdateLeadStatus={onUpdateLeadStatus}
    />
  );
};

export default LeadsContent;
