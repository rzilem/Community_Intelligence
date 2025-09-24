import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CommunicationTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subject?: string;
  content: string;
  is_public?: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCommunicationTemplates = (associationId?: string) => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [associationId]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('communication_templates')
        .select('*');

      const { data, error: fetchError } = await query
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setTemplates(data || []);

    } catch (err) {
      console.error('Error fetching communication templates:', err);
      setError('Failed to load communication templates');
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<CommunicationTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTemplates(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error creating template:', err);
      throw err;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<CommunicationTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTemplates(prev => prev.map(template => 
          template.id === id ? data : template
        ));
        return data;
      }
    } catch (err) {
      console.error('Error updating template:', err);
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('communication_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      console.error('Error deleting template:', err);
      throw err;
    }
  };

  return {
    templates,
    isLoading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};