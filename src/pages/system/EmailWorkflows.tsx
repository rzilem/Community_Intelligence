
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { MailCheck } from 'lucide-react';

const EmailWorkflows = () => {
  return <PageTemplate 
    title="Email Workflows" 
    icon={<MailCheck className="h-8 w-8" />}
    description="Setup and manage automated email workflows and notifications."
  />;
};

export default EmailWorkflows;
