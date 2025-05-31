
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';

const OnboardingTemplateDetailsPage: React.FC = () => {
  return (
    <PageTemplate
      title="Onboarding Template Details"
      icon={<FileText className="h-8 w-8" />}
      description="View and edit onboarding template details"
    >
      <div className="space-y-6">
        <p>Onboarding template details functionality coming soon...</p>
      </div>
    </PageTemplate>
  );
};

export default OnboardingTemplateDetailsPage;
