
import React from 'react';
import { FileText } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import BidRequestForm from '@/components/bid-requests/BidRequestForm';

const CreateBidRequest = () => {
  return (
    <PageTemplate
      title="Create Bid Request"
      icon={<FileText className="h-8 w-8" />}
      description="Create a new bid request for maintenance and improvement projects."
    >
      <BidRequestForm />
    </PageTemplate>
  );
};

export default CreateBidRequest;
