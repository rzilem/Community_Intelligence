
import { useState, useEffect } from 'react';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { OnboardingTemplate } from '@/types/onboarding-types';

export const useTemplateStages = (templates: OnboardingTemplate[]) => {
  const { getTemplateStages } = useOnboardingTemplates();
  const [templateStages, setTemplateStages] = useState<Record<string, any>>({});
  const [loadingStages, setLoadingStages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    templates.forEach(template => {
      if (!templateStages[template.id]) {
        loadStagesForTemplate(template.id);
      }
    });
  }, [templates]);

  const loadStagesForTemplate = async (templateId: string) => {
    setLoadingStages(prev => ({ ...prev, [templateId]: true }));
    try {
      const stages = await getTemplateStages(templateId);
      setTemplateStages(prev => ({ ...prev, [templateId]: stages }));
    } catch (error) {
      console.error('Error loading stages for template:', error);
    } finally {
      setLoadingStages(prev => ({ ...prev, [templateId]: false }));
    }
  };

  return {
    templateStages,
    loadingStages,
    loadStagesForTemplate
  };
};
