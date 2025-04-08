
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardList } from 'lucide-react';

const BidRequests = () => {
  return <PageTemplate 
    title="Bid Requests" 
    icon={<ClipboardList className="h-8 w-8" />}
    description="Manage vendor bid requests and proposals for community projects."
  />;
};

export default BidRequests;
