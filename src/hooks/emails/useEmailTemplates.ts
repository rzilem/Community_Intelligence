
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching templates:', fetchError);
        setError('Failed to fetch templates');
        setTemplates([]);
        return;
      }

      setTemplates((data || []) as EmailTemplate[]);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (template: Partial<EmailTemplate>) => {
    const { data, error: createError } = await supabase
      .from('email_templates')
      .insert({
        name: template.name || 'New Template',
        subject: template.subject || '',
        body: template.body || ''
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating template:', createError);
      throw createError;
    }

    const newTemplate = data as EmailTemplate;
    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  };

  const updateTemplate = async ({ id, data }: { id: string; data: Partial<EmailTemplate> }) => {
    const { data: updated, error: updateError } = await supabase
      .from('email_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating template:', updateError);
      throw updateError;
    }

    const updatedTemplate = updated as EmailTemplate;
    setTemplates(prev => prev.map(t => (t.id === id ? updatedTemplate : t)));
    return updatedTemplate;
  };

  const deleteTemplate = async (templateId: string) => {
    const { error: deleteError } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', templateId);

    if (deleteError) {
      console.error('Error deleting template:', deleteError);
      throw deleteError;
    }

    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
