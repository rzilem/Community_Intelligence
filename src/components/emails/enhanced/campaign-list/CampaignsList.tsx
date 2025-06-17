
import React from 'react';
import { EmailCampaign } from '@/types/email-campaign-types';
import CampaignCard from './CampaignCard';
import EmptyCampaignsState from './EmptyCampaignsState';

interface CampaignsListProps {
  campaigns: EmailCampaign[];
  isLoading: boolean;
  onEdit: (campaign: EmailCampaign) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  onSchedule: (campaign: EmailCampaign) => void;
  onViewAnalytics: (campaign: EmailCampaign) => void;
  onCreateNew: () => void;
}

const CampaignsList: React.FC<CampaignsListProps> = ({
  campaigns,
  isLoading,
  onEdit,
  onDelete,
  onSend,
  onSchedule,
  onViewAnalytics,
  onCreateNew
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return <EmptyCampaignsState onCreateNew={onCreateNew} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map(campaign => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onEdit={onEdit}
          onDelete={onDelete}
          onSend={onSend}
          onSchedule={onSchedule}
          onViewAnalytics={onViewAnalytics}
        />
      ))}
    </div>
  );
};

export default CampaignsList;
