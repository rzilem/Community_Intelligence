
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import AppLayout from '@/components/layout/AppLayout';
import { FileText, Plus, Settings, Filter, SortAsc, SortDesc, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProposalList from '@/components/proposals/ProposalList';
import ProposalForm from '@/components/proposals/ProposalForm';
import ProposalViewer from '@/components/proposals/ProposalViewer';
import { useProposals } from '@/hooks/proposals/useProposals';
import { Proposal, ProposalRecommendation } from '@/types/proposal-types';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AIContentRecommendations from '@/components/proposals/AIContentRecommendations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const Proposals = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [isAIRecommendationsOpen, setIsAIRecommendationsOpen] = useState(false);
  
  const { 
    proposals, 
    isLoading, 
    createProposal, 
    updateProposal, 
    deleteProposal,
    refreshProposals 
  } = useProposals();

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

  const handleDeleteProposal = async (proposalId: string) => {
    try {
      await deleteProposal(proposalId);
      toast.success('Proposal deleted successfully');
    } catch (error: any) {
      toast.error(`Error deleting proposal: ${error.message}`);
    }
  };

  const handleSendProposal = async (proposal: Proposal) => {
    try {
      await updateProposal({
        id: proposal.id,
        data: {
          ...proposal,
          status: 'sent',
          sent_date: new Date().toISOString()
        }
      });
      toast.success(`Proposal '${proposal.name}' has been sent to the client.`);
      setIsViewerOpen(false);
      refreshProposals();
    } catch (error: any) {
      toast.error(`Error sending proposal: ${error.message}`);
    }
  };

  const handleSaveProposal = async (data: Partial<Proposal>) => {
    try {
      if (data.id) {
        // Update existing proposal
        await updateProposal({
          id: data.id,
          data
        });
        toast.success("Proposal updated successfully");
      } else {
        // Create new proposal
        await createProposal(data);
        toast.success("Proposal created successfully");
      }
    } catch (error: any) {
      console.error('Error saving proposal:', error);
      toast.error(`Failed to save proposal: ${error.message}`);
      throw error;
    }
  };

  const handleApplyRecommendation = async (recommendation: ProposalRecommendation) => {
    if (!currentProposal) return;
    
    try {
      let updatedContent = currentProposal.content;
      
      // Logic to apply recommendation based on its category
      switch (recommendation.category) {
        case 'section':
          // Add a new section at the end of the proposal
          updatedContent += recommendation.content || '';
          break;
          
        case 'pricing':
          // For pricing recommendations, find and replace pricing section
          // This is simplified - would need actual DOM manipulation in real app
          updatedContent += recommendation.content || '';
          break;
          
        case 'language':
          // For language recommendations, this would be more complex in real app
          // Just append for demo purposes
          updatedContent += `<div class="ai-recommendation">${recommendation.content || ''}</div>`;
          break;
          
        default:
          updatedContent += recommendation.content || '';
      }
      
      await updateProposal({
        id: currentProposal.id,
        data: {
          ...currentProposal,
          content: updatedContent
        }
      });
      
      toast.success(`Applied recommendation: ${recommendation.title}`);
      setIsAIRecommendationsOpen(false);
      
      // Update the current proposal in state
      const updatedProposal = {
        ...currentProposal,
        content: updatedContent
      };
      setCurrentProposal(updatedProposal);
      
      // Refresh proposal list
      refreshProposals();
    } catch (error: any) {
      toast.error(`Error applying recommendation: ${error.message}`);
    }
  };

  // Calculate some stats for the dashboard
  const totalProposals = proposals.length;
  const pendingProposals = proposals.filter(p => p.status === 'sent' || p.status === 'viewed').length;
  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;
  const totalValue = proposals.reduce((sum, p) => sum + p.amount, 0);
  const acceptedValue = proposals
    .filter(p => p.status === 'accepted')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Get conversion rate
  const sentProposals = proposals.filter(p => 
    p.status === 'sent' || p.status === 'viewed' || p.status === 'accepted' || p.status === 'rejected'
  ).length;
  const conversionRate = sentProposals > 0 ? Math.round((acceptedProposals / sentProposals) * 100) : 0;

  return (
    <AppLayout>
      <PageTemplate 
        title="Proposals" 
        icon={<FileText className="h-8 w-8" />}
        description="Create and manage business proposals for potential clients."
        actions={
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentProposal) {
                  setIsAIRecommendationsOpen(true);
                } else {
                  toast.error("Please select a proposal to get AI recommendations");
                }
              }}
            >
              <BrainCircuit className="mr-2 h-4 w-4" /> AI Recommendations
            </Button>
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
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Proposals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProposals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingProposals} pending review
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Proposal Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total value of all proposals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Accepted Proposals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{acceptedProposals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${acceptedValue.toLocaleString()} in value
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {acceptedProposals} out of {sentProposals} sent
                </p>
              </CardContent>
            </Card>
          </div>
          
          <ProposalList 
            proposals={proposals}
            isLoading={isLoading}
            onEdit={handleEditProposal}
            onView={handleViewProposal}
            onDelete={handleDeleteProposal}
            onSend={handleSendProposal}
            onSelect={setCurrentProposal}
            selectedProposal={currentProposal}
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
          
          <Dialog 
            open={isAIRecommendationsOpen} 
            onOpenChange={setIsAIRecommendationsOpen}
          >
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>AI Content Recommendations</DialogTitle>
                <DialogDescription>
                  Get intelligent suggestions to improve your proposal based on analytics and successful patterns
                </DialogDescription>
              </DialogHeader>
              
              {currentProposal && (
                <AIContentRecommendations 
                  proposal={currentProposal}
                  onApplyRecommendation={handleApplyRecommendation}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default Proposals;
