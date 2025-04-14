
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardList } from 'lucide-react';
import ProposalRequestForm from '@/components/proposal-request/ProposalRequestForm';

const ProposalRequest: React.FC = () => {
  return (
    <PageTemplate
      title="Request a Management Proposal"
      icon={<ClipboardList className="h-8 w-8" />}
      description="Submit a request for vendor bids on your community projects"
    >
      <div className="py-6">
        <ProposalRequestForm />
      </div>
    </PageTemplate>
  );
};

export default ProposalRequest;
