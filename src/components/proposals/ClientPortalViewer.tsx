import React, { useState, useEffect } from 'react';
import { Proposal, ProposalVideo } from '@/types/proposal-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Check, X, MessageCircle, FileText, Calculator, Video, PenTool } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import SignatureCanvas from 'react-signature-canvas';
import CostCalculator from './interactive-calculator/CostCalculator';
import ProposalVideoSection from './video-integration/ProposalVideoSection';

interface ClientPortalViewerProps {
  proposal: Proposal;
  clientName: string;
  companyName: string;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  onComment: (comment: string) => Promise<void>;
}

const ClientPortalViewer: React.FC<ClientPortalViewerProps> = ({
  proposal,
  clientName,
  companyName,
  onAccept,
  onReject,
  onComment
}) => {
  const { toast: uiToast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [comment, setComment] = useState('');
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [signatureRef, setSignatureRef] = useState<SignatureCanvas | null>(null);
  const [activeTab, setActiveTab] = useState("proposal");
  
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

  useEffect(() => {
    const trackView = async () => {
      console.log('Tracking view for proposal:', proposal.id);
    };
    
    trackView();
  }, [proposal.id]);

  const handleAccept = async () => {
    if (proposal.signature_required && !isSignatureDialogOpen) {
      setIsSignatureDialogOpen(true);
      return;
    }
    
    try {
      setIsAccepting(true);
      
      let signatureData = '';
      if (proposal.signature_required && signatureRef) {
        if (signatureRef.isEmpty()) {
          uiToast({
            title: "Signature Required",
            description: "Please sign the document before accepting",
            variant: "destructive"
          });
          setIsAccepting(false);
          return;
        }
        
        signatureData = signatureRef.toDataURL('image/png');
      }
      
      await onAccept();
      
      if (proposal.signature_required) {
        setIsSignatureDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(`Error accepting proposal: ${error.message}`);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      await onReject();
    } catch (error: any) {
      toast.error(`Error declining proposal: ${error.message}`);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    
    try {
      await onComment(comment);
      setComment('');
      uiToast({
        title: "Comment Sent",
        description: "Your comment has been sent successfully"
      });
    } catch (error: any) {
      uiToast({
        title: "Error",
        description: `Failed to send comment: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const clearSignature = () => {
    if (signatureRef) {
      signatureRef.clear();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto">
        <Card className="border-t-4 border-t-primary mb-8">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{proposal.name}</CardTitle>
                <CardDescription>
                  Proposal for {clientName} | {companyName}
                </CardDescription>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => proposal.signature_required ? setIsSignatureDialogOpen(true) : handleAccept()}
                  disabled={isAccepting || isRejecting}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button 
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={handleReject}
                  disabled={isAccepting || isRejecting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <Tabs defaultValue="proposal" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="proposal" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Proposal
                </TabsTrigger>
                <TabsTrigger value="calculator" className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  Cost Calculator
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="pt-4">
              <TabsContent value="proposal" className="mt-0">
                <div 
                  className="border rounded-md p-8 bg-white min-h-[60vh]"
                  dangerouslySetInnerHTML={{ __html: proposal.content }}
                />
              </TabsContent>
              
              <TabsContent value="calculator" className="mt-0">
                <CostCalculator
                  calculator={proposal.interactive_calculator || demoCalculator}
                  readOnly={false}
                />
              </TabsContent>
              
              <TabsContent value="videos" className="mt-0">
                <ProposalVideoSection 
                  videos={(proposal.videos || demoVideos) as ProposalVideo[]}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <Separator />
          
          <CardFooter className="flex flex-col pt-6">
            <div className="w-full">
              <Label htmlFor="comment">Send a Comment</Label>
              <div className="flex mt-2">
                <Textarea 
                  id="comment"
                  placeholder="Ask a question or provide feedback..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 rounded-r-none"
                />
                <Button 
                  variant="default" 
                  className="rounded-l-none"
                  onClick={handleSendComment}
                  disabled={!comment.trim()}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign to Accept Proposal</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please sign below to accept the proposal.
            </p>
            
            <div className="border rounded-md">
              <SignatureCanvas
                ref={(ref) => setSignatureRef(ref)}
                penColor="black"
                canvasProps={{
                  className: "w-full h-64 signature-canvas"
                }}
              />
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearSignature}>
                Clear
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSignatureDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={isAccepting}
            >
              <PenTool className="h-4 w-4 mr-2" />
              {isAccepting ? 'Processing...' : 'Sign & Accept'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPortalViewer;
