
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Mail } from 'lucide-react';

const EmailCampaigns = () => {
  return <PageTemplate 
    title="Email Campaigns" 
    icon={<Mail className="h-8 w-8" />}
    description="Create and manage email marketing campaigns to potential clients."
  />;
};

export default EmailCampaigns;
