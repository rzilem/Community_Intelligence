
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardList, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bidRequestService } from '@/services/bid-request-service';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { useAuth } from '@/contexts/AuthContext';
import BidRequestList from '@/components/bid-requests/BidRequestList';

const BidRequests: React.FC = () => {
  const [bidRequests, setBidRequests] = useState<BidRequestWithVendors[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const associationId = profile?.activeAssociationId || '';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBidRequests = async () => {
      // Fetch bid requests for the active association
      if (user && associationId) {
        setIsLoading(true);
        try {
          const requests = await bidRequestService.getBidRequests(associationId);
          setBidRequests(requests);
        } catch (error) {
          console.error('Error fetching bid requests:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBidRequests();
  }, [user, associationId]);

  const handleCreateClick = () => {
    navigate('/community-management/create-bid-request');
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
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" /> New Bid Request
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading bid requests...</p>
        </div>
      ) : (
        <BidRequestList bidRequests={bidRequests} />
      )}
    </PageTemplate>
  );
};

export default BidRequests;
