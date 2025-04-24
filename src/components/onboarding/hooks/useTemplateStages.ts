
import { useState, useEffect } from 'react';
import { OnboardingStage, OnboardingTemplate } from '@/types/onboarding-types';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';

export const useTemplateStages = (templates: OnboardingTemplate[]) => {
  const [templateStages, setTemplateStages] = useState<Record<string, OnboardingStage[]>>({});
  const [loadingStages, setLoadingStages] = useState(true);
  const { getTemplateStages } = useOnboardingTemplates();

  useEffect(() => {
    const fetchStages = async () => {
      if (!templates.length) {
        setLoadingStages(false);
        return;
      }
      
      setLoadingStages(true);
      const stagesData: Record<string, OnboardingStage[]> = {};
      
      for (const template of templates) {
        try {
          const stages = await getTemplateStages(template.id);
          stagesData[template.id] = stages;
        } catch (error) {
          console.error(`Error fetching stages for template ${template.id}:`, error);
          stagesData[template.id] = [];
        }
      }
      
      setTemplateStages(stagesData);
      setLoadingStages(false);
    };

    fetchStages();
  }, [templates, getTemplateStages]);

  return {
    templateStages,
    loadingStages
  };
};
