
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { UserPlus } from 'lucide-react';

const OnboardingTemplatesPage: React.FC = () => {
  return (
    <PageTemplate
      title="Onboarding Templates"
      icon={<UserPlus className="h-8 w-8" />}
      description="Manage onboarding templates"
    >
      <div className="space-y-6">
        <p>Onboarding templates functionality coming soon...</p>
      </div>
    </PageTemplate>
  );
};

export default OnboardingTemplatesPage;
