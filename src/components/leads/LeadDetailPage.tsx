
import React from 'react';
import { useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';

// Import the custom hook and components
import { useLeadDetail } from '@/hooks/leads/useLeadDetail';
import LeadDetailHeader from './detail/LeadDetailHeader';
import LeadDetailTabs from './detail/LeadDetailTabs';
import LoadingState from './detail/LoadingState';
import NotFoundState from './detail/NotFoundState';

const LeadDetailPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const { lead, loading, handleStatusChange, handleSaveNotes } = useLeadDetail(leadId);

  if (loading) {
    return <LoadingState />;
  }

  if (!lead) {
    return <NotFoundState />;
  }

  return (
    <PageTemplate 
      title={lead.association_name || lead.name} 
      icon={<User className="h-8 w-8" />}
      description={`Lead details for ${lead.email}`}
      actions={
        <LeadDetailHeader
          lead={lead}
          onStatusChange={handleStatusChange}
        />
      }
    >
      <LeadDetailTabs lead={lead} onSaveNotes={handleSaveNotes} />
    </PageTemplate>
  );
};

export default LeadDetailPage;
