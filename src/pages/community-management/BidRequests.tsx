
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardList, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { bidRequestService } from '@/services/bid-request-service';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { useAuth } from '@/contexts/AuthContext';
import BidRequestForm from '@/components/bid-requests/BidRequestForm';
import BidRequestList from '@/components/bid-requests/BidRequestList';

const BidRequests: React.FC = () => {
  const [bidRequests, setBidRequests] = useState<BidRequestWithVendors[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, profile } = useAuth();
  const associationId = profile?.activeAssociationId || '';

  useEffect(() => {
    const fetchBidRequests = async () => {
      // Fetch bid requests for the active association
      if (user && associationId) {
        try {
          const requests = await bidRequestService.getBidRequests(associationId);
          setBidRequests(requests);
        } catch (error) {
          console.error('Error fetching bid requests:', error);
        }
      }
    };

    fetchBidRequests();
  }, [user, associationId]);

  const handleCreateBidRequest = async (newBidRequest: Partial<BidRequestWithVendors>) => {
    try {
      const createdRequest = await bidRequestService.createBidRequest({
        ...newBidRequest,
        associationId: associationId,
        createdBy: user?.id || '',
      });
      
      // Refresh the list of bid requests
      const updatedRequests = await bidRequestService.getBidRequests(associationId);
      setBidRequests(updatedRequests);
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating bid request:', error);
    }
  };

  return (
    <PageTemplate 
      title="Bid Requests" 
      icon={<ClipboardList className="h-8 w-8" />}
      description="Manage vendor bid requests and proposals for community projects."
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="mr-2">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Bid Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Create New Bid Request</DialogTitle>
              </DialogHeader>
              <BidRequestForm onSubmit={handleCreateBidRequest} />
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <BidRequestList bidRequests={bidRequests} />
    </PageTemplate>
  );
};

export default BidRequests;
