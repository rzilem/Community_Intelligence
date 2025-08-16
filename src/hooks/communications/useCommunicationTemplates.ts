import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CommunicationTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: string;
  subject?: string;
  content: string;
  variables?: string[];
  is_active: boolean;
  association_id?: string;
  created_by?: string;
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

      if (associationId) {
        query = query.or(`association_id.eq.${associationId},association_id.is.null`);
      } else {
        query = query.is('association_id', null);
      }

      const { data, error: fetchError } = await query
        .eq('is_active', true)
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