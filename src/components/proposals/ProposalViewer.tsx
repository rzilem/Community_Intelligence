import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Download, 
  Eye, 
  Clock, 
  Calendar, 
  BarChart, 
  Share2,
  Calculator,
  Video,
  BellDot
} from 'lucide-react';
import { Proposal, ProposalFollowUp, ProposalVideo } from '@/types/proposal-types';
import ProposalAnalyticsDashboard from './analytics/ProposalAnalyticsDashboard';
import ClientPortalLinkGenerator from './ClientPortalLinkGenerator';
import CostCalculator from './interactive-calculator/CostCalculator';
import ProposalVideoSection from './video-integration/ProposalVideoSection';
import FollowUpManager from './follow-ups/FollowUpManager';
import { toast } from 'sonner';

interface ProposalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
  onSend: () => void;
  onUpdateProposal?: (updatedProposal: Partial<Proposal>) => Promise<void>;
}

const ProposalViewer: React.FC<ProposalViewerProps> = ({
  isOpen,
  onClose,
  proposal,
  onSend,
  onUpdateProposal
}) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const handleDownload = () => {
    setIsGeneratingPdf(true);
    // In a real implementation, this would generate a PDF
    setTimeout(() => {
      setIsGeneratingPdf(false);
      toast.success("Proposal PDF has been generated and downloaded.");
    }, 1500);
  };

  const handleShare = () => {
    // Generate a shareable link (for demo purposes)
    const demoLink = `https://app.yourcompany.com/p/${proposal.id}`;
    navigator.clipboard.writeText(demoLink);
    toast.success("Shareable link copied to clipboard");
  };

  const handlePortalLinkGenerated = (link: string) => {
    toast.success("Client portal link generated successfully");
  };
  
  const handlePriceUpdate = async (totalPrice: number, selectedOptions: any[]) => {
    if (onUpdateProposal) {
      try {
        await onUpdateProposal({
          ...proposal,
          amount: totalPrice
        });
        toast.success("Proposal price updated successfully");
      } catch (error) {
        toast.error("Failed to update proposal price");
      }
    }
  };

  const handleAddFollowUp = async (followUp: any) => {
    try {
      // In a real implementation, this would call an API to add the follow-up
      toast.success("Follow-up scheduled successfully");
      return Promise.resolve();
    } catch (error) {
      toast.error("Failed to schedule follow-up");
      return Promise.reject(error);
    }
  };

  const handleDeleteFollowUp = async (id: string) => {
    try {
      // In a real implementation, this would call an API to delete the follow-up
      toast.success("Follow-up cancelled successfully");
      return Promise.resolve();
    } catch (error) {
      toast.error("Failed to cancel follow-up");
      return Promise.reject(error);
    }
  };

  const demoCalculator = {
    id: '1',
    proposal_id: proposal.id,
    base_price: proposal.amount || 5000,
    options: [
      {
        id: 'opt1',
        name: 'Premium Management Package',
        description: 'Enhanced management services including quarterly inspections',
        price: 1500,
        selected: false
      },
      {
        id: 'opt2',
        name: 'Accounting & Financial Services',
        description: 'Comprehensive financial management and reporting',
        price: 1200,
        selected: false,
        options: [
          {
            id: 'opt2-1',
            name: 'Monthly Financial Reviews',
            description: 'Additional monthly financial reviews with the board',
            price: 300,
            selected: false
          },
          {
            id: 'opt2-2',
            name: 'Annual Audit Support',
            description: 'Assistance with annual financial audits',
            price: 500,
            selected: false
          }
        ]
      },
      {
        id: 'opt3',
        name: 'Maintenance & Inspections',
        description: 'Regular property maintenance and inspection services',
        price: 900,
        selected: false
      },
      {
        id: 'opt4',
        name: 'Compliance & Legal Support',
        description: 'Assistance with legal compliance and documentation',
        price: 1100,
        selected: false
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const demoVideos: ProposalVideo[] = [
    {
      id: 'v1',
      proposal_id: proposal.id,
      title: 'Client Testimonial - Oakridge Estates',
      description: 'Hear what the board president at Oakridge Estates has to say about our services',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual video URL
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      duration: 184,
      type: 'testimonial',
      created_at: new Date().toISOString()
    },
    {
      id: 'v2',
      proposal_id: proposal.id,
      title: 'Meet Your Management Team',
      description: 'Introduction to the team that will be managing your property',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual video URL
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      duration: 156,
      type: 'team_intro',
      created_at: new Date().toISOString()
    },
    {
      id: 'v3',
      proposal_id: proposal.id,
      title: 'Community Management Walkthrough',
      description: 'See how our management software works for board members',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual video URL
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      duration: 210,
      type: 'property_tour',
      created_at: new Date().toISOString()
    }
  ];
  
  const demoFollowUps: ProposalFollowUp[] = [
    {
      id: 'f1',
      proposal_id: proposal.id,
      scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      message_template: 'Hi {client_name}, I wanted to follow up on the proposal we sent for {proposal_name}. Have you had a chance to review it? I\'d be happy to answer any questions you might have.',
      trigger_type: 'days_after_send',
      trigger_days: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'f2',
      proposal_id: proposal.id,
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      message_template: 'Hi {client_name}, I noticed you viewed our proposal for {proposal_name} but we haven\'t heard back. I\'d love to discuss any questions or concerns you might have about the proposed services.',
      trigger_type: 'days_after_view',
      trigger_days: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl">{proposal.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getStatusBadgeColor(proposal.status)}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {new Date(proposal.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isGeneratingPdf}>
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {proposal.status === 'draft' && (
              <Button size="sm" onClick={onSend}>
                <Send className="h-4 w-4 mr-2" />
                Send to Client
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="my-2 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex items-center p-2 rounded-md bg-blue-50">
            <Eye className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <div className="text-sm font-medium">Status</div>
              <div className="text-sm">
                {proposal.status === 'viewed' ? 'Viewed by client' : 
                 proposal.status === 'sent' ? 'Sent, awaiting view' :
                 proposal.status === 'accepted' ? 'Accepted by client' :
                 proposal.status === 'rejected' ? 'Declined by client' : 'Draft'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center p-2 rounded-md bg-green-50">
            <Clock className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <div className="text-sm font-medium">Proposal Value</div>
              <div className="text-sm">${proposal.amount.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex items-center p-2 rounded-md bg-purple-50">
            <Calendar className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <div className="text-sm font-medium">Last Activity</div>
              <div className="text-sm">
                {proposal.updated_at ? new Date(proposal.updated_at).toLocaleDateString() : 'No activity'}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="client-portal">Client Portal</TabsTrigger>
            <TabsTrigger value="calculator">Cost Calculator</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-0">
            <div 
              className="border rounded-md p-8 bg-white min-h-[500px]"
              dangerouslySetInnerHTML={{ __html: proposal.content }}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <ProposalAnalyticsDashboard 
              proposalId={proposal.id} 
              proposalName={proposal.name}
              analytics={proposal.analytics}
            />
          </TabsContent>
          
          <TabsContent value="client-portal" className="mt-0">
            <div className="border rounded-md p-6 bg-white">
              <h3 className="text-lg font-medium mb-4">Client Portal Access</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Generate a secure link for your client to view and respond to this proposal online.
                The client portal offers interactive features and real-time analytics.
              </p>
              
              <ClientPortalLinkGenerator 
                proposal={proposal}
                onLinkGenerated={handlePortalLinkGenerated}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="calculator" className="mt-0">
            <CostCalculator 
              calculator={proposal.interactive_calculator || demoCalculator}
              onPriceUpdate={handlePriceUpdate}
            />
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            <ProposalVideoSection 
              videos={(proposal.videos || demoVideos) as ProposalVideo[]} 
            />
          </TabsContent>
          
          <TabsContent value="follow-ups" className="mt-0">
            <FollowUpManager 
              proposal={proposal}
              followUps={(proposal.follow_ups || demoFollowUps) as ProposalFollowUp[]}
              onAddFollowUp={handleAddFollowUp}
              onDeleteFollowUp={handleDeleteFollowUp}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalViewer;
