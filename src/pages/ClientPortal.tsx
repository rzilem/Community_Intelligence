
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProposals } from '@/hooks/proposals/useProposals';
import ClientPortalViewer from '@/components/proposals/ClientPortalViewer';
import { Proposal } from '@/types/proposal-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ClientPortal: React.FC = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('access');
  const { getProposal, updateProposal } = useProposals();
  const navigate = useNavigate();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadProposal = async () => {
      if (!proposalId) return;
      
      try {
        setIsLoading(true);
        const proposalData = await getProposal(proposalId);
        
        if (!proposalData) {
          setError('Proposal not found');
          return;
        }
        
        // Update view analytics when the proposal is accessed
        if (proposalData.status === 'sent') {
          const updatedProposal = {
            ...proposalData,
            status: 'viewed' as 'viewed', // Type assertion here
            viewed_date: new Date().toISOString(),
            analytics: {
              ...(proposalData.analytics || {}),
              views: ((proposalData.analytics?.views || 0) + 1),
              initial_view_date: proposalData.analytics?.initial_view_date || new Date().toISOString(),
              last_view_date: new Date().toISOString()
            }
          };
          
          await updateProposal({
            id: proposalId,
            data: updatedProposal
          });
          
          setProposal(updatedProposal as Proposal); // Type assertion here
        } else {
          setProposal(proposalData);
        }
        
        // For demo purposes, we'll check if the proposal should be password protected
        // In a real implementation, this would be a property on the proposal
        if (proposalData.id.charCodeAt(0) % 3 === 0) {
          setIsProtected(true);
        }
      } catch (error) {
        console.error('Error loading proposal:', error);
        setError('Error loading proposal');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProposal();
  }, [proposalId, getProposal, updateProposal]);
  
  const handleAccept = async () => {
    if (!proposal) return;
    
    try {
      const updatedProposal = {
        ...proposal,
        status: 'accepted' as 'accepted', // Type assertion here
        responded_date: new Date().toISOString()
      };
      
      await updateProposal({
        id: proposal.id,
        data: updatedProposal
      });
      
      toast.success('Proposal accepted successfully');
      setProposal(updatedProposal as Proposal); // Type assertion here
    } catch (error: any) {
      toast.error(`Error accepting proposal: ${error.message}`);
    }
  };
  
  const handleReject = async () => {
    if (!proposal) return;
    
    try {
      const updatedProposal = {
        ...proposal,
        status: 'rejected' as 'rejected', // Type assertion here
        responded_date: new Date().toISOString()
      };
      
      await updateProposal({
        id: proposal.id,
        data: updatedProposal
      });
      
      toast.success('Proposal declined');
      setProposal(updatedProposal as Proposal); // Type assertion here
    } catch (error: any) {
      toast.error(`Error declining proposal: ${error.message}`);
    }
  };
  
  const handleComment = async (comment: string) => {
    // In a real implementation, this would save the comment to the database
    toast.success('Comment sent successfully');
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes, any password works
    setIsProtected(false);
    toast.success('Access granted');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-medium">Loading proposal...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we prepare your document</p>
        </div>
      </div>
    );
  }
  
  if (error || !proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem loading this proposal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error || 'Proposal not found'}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (isProtected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password Protected</CardTitle>
            <CardDescription>
              This proposal is protected. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={!password}
              >
                Access Proposal
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
  
  if (proposal.status === 'accepted') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Proposal Accepted</CardTitle>
            <CardDescription>
              Thank you for accepting this proposal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You have successfully accepted the proposal "{proposal.name}". 
              Our team will be in touch shortly to discuss next steps.
            </p>
            <p className="text-sm text-muted-foreground">
              Accepted on: {new Date(proposal.responded_date || '').toLocaleString()}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (proposal.status === 'rejected') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Proposal Declined</CardTitle>
            <CardDescription>
              You have declined this proposal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You have declined the proposal "{proposal.name}". 
              If you'd like to discuss alternatives, please contact us.
            </p>
            <p className="text-sm text-muted-foreground">
              Declined on: {new Date(proposal.responded_date || '').toLocaleString()}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <ClientPortalViewer
      proposal={proposal}
      clientName="John Smith" // In a real app, this would come from the lead data
      companyName="Oakridge Estates"
      onAccept={handleAccept}
      onReject={handleReject}
      onComment={handleComment}
    />
  );
};

export default ClientPortal;
