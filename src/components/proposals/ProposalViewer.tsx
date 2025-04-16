
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
  Share2 
} from 'lucide-react';
import { Proposal } from '@/types/proposal-types';
import ProposalAnalyticsDashboard from './analytics/ProposalAnalyticsDashboard';
import { toast } from 'sonner';

interface ProposalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
  onSend: () => void;
}

const ProposalViewer: React.FC<ProposalViewerProps> = ({
  isOpen,
  onClose,
  proposal,
  onSend
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
