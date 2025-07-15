
import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import BidRequestsList from '@/components/bid-requests/BidRequestsList';

const BidRequests = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Bid Requests"
        icon={<FileText className="h-8 w-8" />}
        description="Manage and track bid requests for maintenance and improvement projects."
        actions={
          <Link to="/community-management/create-bid-request">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create Bid Request
            </Button>
          </Link>
        }
      >
        <BidRequestsList />
      </PageTemplate>
    </AppLayout>
  );
};

export default BidRequests;
