
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatePollParams {
  title: string;
  description: string;
  options: string[];
  associationId: string;
  createdBy: string;
  closesAt?: Date;
}

export function usePollCreate() {
  const [isLoading, setIsLoading] = useState(false);

  const createPoll = async (params: CreatePollParams) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_polls')
        .insert({
          title: params.title,
          description: params.description,
          options: params.options,
          association_id: params.associationId,
          created_by: params.createdBy,
          closes_at: params.closesAt?.toISOString() || null
        })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast.error(`Failed to create poll: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPoll,
    isLoading
  };
}
