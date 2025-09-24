import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate } from '@/types/email-campaign-types';

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
        .order('createdat', { ascending: false });

      if (fetchError) {
        console.error('Error fetching templates:', fetchError);
        setError('Failed to fetch templates');
        setTemplates([]);
        return;
      }

      // Map database fields to EmailTemplate interface
      const mappedTemplates = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        body: template.body,
        category: template.category as any,
        created_at: template.createdat,
        updated_at: template.updatedat,
        created_by: template.createdby,
        merge_tags: [],
        is_active: true,
        version: 1
      }));
      setTemplates(mappedTemplates);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (template: Partial<EmailTemplate>) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error: createError } = await supabase
      .from('email_templates')
      .insert({
        name: template.name || 'New Template',
        subject: template.subject || '',
        body: template.body || '',
        category: (template.category as any) || 'custom',
        createdby: user.user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating template:', createError);
      throw createError;
    }

    const newTemplate: EmailTemplate = {
      id: data.id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      category: data.category as any,
      created_at: data.createdat,
      updated_at: data.updatedat,
      created_by: data.createdby,
      merge_tags: [],
      is_active: true,
      version: 1
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  };

  const updateTemplate = async ({ id, data }: { id: string; data: Partial<EmailTemplate> }) => {
    const { data: updated, error: updateError } = await supabase
      .from('email_templates')
      .update({
        name: data.name,
        subject: data.subject,
        body: data.body,
      category: data.category as any,
        updatedat: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating template:', updateError);
      throw updateError;
    }

    const updatedTemplate: EmailTemplate = {
      id: updated.id,
      name: updated.name,
      subject: updated.subject,
      body: updated.body,
      category: updated.category as any,
      created_at: updated.createdat,
      updated_at: updated.updatedat,
      created_by: updated.createdby,
      merge_tags: [],
      is_active: true,
      version: 1
    };
    
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