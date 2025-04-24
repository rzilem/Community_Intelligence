
import { toast } from 'sonner';
import { OnboardingStage } from '@/types/onboarding-types';
import { supabase } from '@/integrations/supabase/client';

export const useStageOperations = () => {
  const getTemplateStages = async (templateId: string): Promise<OnboardingStage[]> => {
    try {
      const { data, error } = await supabase
        .from('onboarding_stages')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index', { ascending: true });
        
      if (error) {
        toast.error(`Error loading stages: ${error.message}`);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching template stages:', error);
      return [];
    }
  };
  
  const createStage = async (stage: Omit<OnboardingStage, 'id' | 'created_at' | 'updated_at'>): Promise<OnboardingStage> => {
    try {
      const { data, error } = await supabase
        .from('onboarding_stages')
        .insert([stage])
        .select()
        .single();
        
      if (error) {
        toast.error(`Error creating stage: ${error.message}`);
        throw error;
      }
      
      toast.success('Stage created successfully');
      return data;
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  };
  
  const updateStage = async ({ id, data }: { id: string; data: Partial<OnboardingStage> }): Promise<OnboardingStage> => {
    try {
      const { data: updatedStage, error } = await supabase
        .from('onboarding_stages')
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        toast.error(`Error updating stage: ${error.message}`);
        throw error;
      }
      
      toast.success('Stage updated successfully');
      return updatedStage;
    } catch (error) {
      console.error('Error updating stage:', error);
      throw error;
    }
  };
  
  const deleteStage = async (id: string): Promise<void> => {
    try {
      const { error: tasksDeletionError } = await supabase
        .from('onboarding_tasks')
        .delete()
        .eq('stage_id', id);
      
      if (tasksDeletionError) {
        toast.error(`Error deleting stage tasks: ${tasksDeletionError.message}`);
        throw tasksDeletionError;
      }
      
      const { error } = await supabase
        .from('onboarding_stages')
        .delete()
        .eq('id', id);
        
      if (error) {
        toast.error(`Error deleting stage: ${error.message}`);
        throw error;
      }
      
      toast.success('Stage deleted successfully');
    } catch (error) {
      console.error('Error deleting stage:', error);
      throw error;
    }
  };

  return {
    getTemplateStages,
    createStage,
    updateStage,
    deleteStage
  };
};
