import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProposalList from '@/components/proposals/ProposalList';
import ProposalForm from '@/components/proposals/ProposalForm';
import ProposalViewer from '@/components/proposals/ProposalViewer';
import { useProposals } from '@/hooks/proposals/useProposals';
import { Proposal } from '@/types/proposal-types';
import { toast } from 'sonner';

const Proposals = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  
  const { createProposal, updateProposal } = useProposals();

  const handleCreateProposal = () => {
    setCurrentProposal(null);
    setIsFormOpen(true);
  };

  const handleEditProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setIsFormOpen(true);
  };

  const handleViewProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setIsViewerOpen(true);
  };

  const handleDeleteProposal = (proposalId: string) => {
    // Delete is handled in the ProposalList component
  };

  const handleSendProposal = (proposal: Proposal) => {
    toast.success(`Proposal '${proposal.name}' will be sent to the client.`);
    // In a real implementation, this would update the proposal status and send an email
  };

  const handleSaveProposal = async (data: Partial<Proposal>) => {
    try {
      if (data.id) {
        // Update existing proposal
        await updateProposal({ id: data.id, data });
        toast.success('Proposal updated successfully');
      } else {
        // Create new proposal
        await createProposal(data);
        toast.success('Proposal created successfully');
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast.error('Failed to save proposal');
    }
  };

  return (
    <PageTemplate 
      title="Proposals" 
      icon={<FileText className="h-8 w-8" />}
      description="Create and manage business proposals for potential clients."
      actions={
        <div className="flex space-x-2">
          <Link to="/lead-management/templates">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Manage Templates
            </Button>
          </Link>
          <Button onClick={handleCreateProposal}>
            <Plus className="mr-2 h-4 w-4" /> Create Proposal
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <ProposalList 
          onEdit={handleEditProposal}
          onView={handleViewProposal}
          onDelete={handleDeleteProposal}
          onSend={handleSendProposal}
        />
        
        {isFormOpen && (
          <ProposalForm 
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSaveProposal}
            proposal={currentProposal || undefined}
          />
        )}
        
        {isViewerOpen && currentProposal && (
          <ProposalViewer 
            isOpen={isViewerOpen}
            onClose={() => setIsViewerOpen(false)}
            proposal={currentProposal}
            onSend={() => handleSendProposal(currentProposal)}
          />
        )}
      </div>
    </PageTemplate>
  );
};

export default Proposals;
