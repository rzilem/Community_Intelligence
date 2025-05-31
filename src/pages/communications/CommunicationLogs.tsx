
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Mail } from 'lucide-react';

const CommunicationLogs: React.FC = () => {
  return (
    <PageTemplate
      title="Communication Logs"
      icon={<Mail className="h-8 w-8" />}
      description="View communication logs and history"
    >
      <div className="space-y-6">
        <p>Communication logs functionality coming soon...</p>
      </div>
    </PageTemplate>
  );
};

export default CommunicationLogs;
