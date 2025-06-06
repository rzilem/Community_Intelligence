
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageTemplate from '@/components/layout/PageTemplate';
import BidRequestForm from '@/components/bid-requests/BidRequestForm';

const CreateBidRequest = () => {
  const navigate = useNavigate();

  return (
    <PageTemplate
      title="Create Bid Request"
      icon={<ArrowLeft className="h-8 w-8" />}
      description="Create a new request for vendor bids on maintenance or improvement projects."
      actions={
        <Button
          variant="outline"
          onClick={() => navigate('/community-management/bid-requests')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bid Requests
        </Button>
      }
    >
      <BidRequestForm />
    </PageTemplate>
  );
};

export default CreateBidRequest;
