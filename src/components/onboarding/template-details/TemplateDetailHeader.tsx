
import React from 'react';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { getTemplateIcon } from '../onboarding-utils';

interface TemplateDetailHeaderProps {
  template: OnboardingTemplate;
}

const TemplateDetailHeader = ({ template }: TemplateDetailHeaderProps) => {
  return (
    <div className="flex items-center">
      {getTemplateIcon(template.template_type)}
      <h1 className="text-2xl font-bold ml-2">{template.name}</h1>
    </div>
  );
};

export default TemplateDetailHeader;
