
import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageTemplate from '@/components/layout/PageTemplate';
import BidRequestsList from '@/components/bid-requests/BidRequestsList';

const BidRequests = () => {
  return (
    <PageTemplate
      title="Bid Requests"
      icon={<Plus className="h-8 w-8" />}
      description="Manage and track bid requests for maintenance and improvement projects."
      actions={
        <Link to="/community-management/bid-requests/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Bid Request
          </Button>
        </Link>
      }
    >
      <BidRequestsList />
    </PageTemplate>
  );
};

export default BidRequests;
