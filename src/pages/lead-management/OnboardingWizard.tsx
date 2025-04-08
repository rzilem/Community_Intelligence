
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardCheck } from 'lucide-react';

const OnboardingWizard = () => {
  return <PageTemplate 
    title="Onboarding Wizard" 
    icon={<ClipboardCheck className="h-8 w-8" />}
    description="Streamlined process for onboarding new communities and clients."
  />;
};

export default OnboardingWizard;
