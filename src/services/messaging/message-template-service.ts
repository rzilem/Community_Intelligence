
import { supabase } from '@/integrations/supabase/client';
import { MessageTemplateData } from '@/types/messaging-types';
import { MessageCategory } from '@/types/communication-types';

/**
 * Service for managing message templates
 */
export const messageTemplateService = {
  /**
   * Get templates for an association
   * @param associationId The ID of the association
   * @returns Array of templates
   */
  getTemplates: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching message templates:', error);
      return { data: null, error };
    }
  },
  
  /**
   * Create a new template
   * @param template Template data to create
   * @returns The created template
   */
  createTemplate: async (template: {
    title: string;
    description: string;
    content: string;
    type: 'email' | 'sms';
    category: MessageCategory;
    association_id: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert([template])
        .select()
        .single();
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating message template:', error);
      return { data: null, error };
    }
  },
  
  /**
   * Update an existing template
   * @param templateId ID of the template to update
   * @param updates Updates to apply
   * @returns The updated template
   */
  updateTemplate: async (templateId: string, updates: Partial<MessageTemplateData>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating message template:', error);
      return { data: null, error };
    }
  },
  
  /**
   * Delete a template
   * @param templateId ID of the template to delete
   * @returns Success indicator
   */
  deleteTemplate: async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId);
        
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting message template:', error);
      return { success: false, error };
    }
  }
};
