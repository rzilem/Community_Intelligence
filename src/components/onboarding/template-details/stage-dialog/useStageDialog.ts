
import { useState, useEffect } from 'react';
import { OnboardingStage } from '@/types/onboarding-types';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { toast } from 'sonner';

interface StageFormData {
  name: string;
  description: string;
  estimated_days: number;
}

export function useStageDialog(stage: OnboardingStage, onSubmit: () => void, onOpenChange: (open: boolean) => void) {
  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    description: '',
    estimated_days: 0
  });

  const { updateStage, isUpdating } = useOnboardingTemplates();

  useEffect(() => {
    if (stage) {
      setFormData({
        name: stage.name,
        description: stage.description || '',
        estimated_days: stage.estimated_days || 0
      });
    }
  }, [stage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'estimated_days' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Stage name is required');
      return;
    }

    try {
      await updateStage({
        id: stage.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          estimated_days: formData.estimated_days
        }
      });
      
      onOpenChange(false);
      onSubmit();
      toast.success('Stage updated successfully');
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    }
  };

  return {
    formData,
    isUpdating,
    handleInputChange,
    handleSave
  };
}
