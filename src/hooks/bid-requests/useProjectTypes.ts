
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  conditional_fields: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useProjectTypes = () => {
  return useQuery({
    queryKey: ['project-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as ProjectType[];
    },
  });
};
