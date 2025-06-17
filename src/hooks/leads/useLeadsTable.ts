
import { useState } from 'react';
import { Lead } from '@/types/lead-types';

interface UseLeadsTableProps {
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: Lead['status']) => void;
}

export const useLeadsTable = ({ onDeleteLead, onUpdateLeadStatus }: UseLeadsTableProps) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await onDeleteLead(leadId);
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: Lead['status']) => {
    try {
      await onUpdateLeadStatus(leadId, status);
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  return {
    selectedLead,
    isDetailOpen,
    setIsDetailOpen,
    handleViewDetails,
    handleDeleteLead,
    handleUpdateStatus
  };
};
