
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Announcement } from '@/types/communication-types';

export interface RecipientGroup {
  id: string;
  association_id: string;
  name: string;
  description: string | null;
  group_type: 'system' | 'custom';
  criteria: any | null;
  created_at: string;
  updated_at: string;
}

export const communicationService = {
  // Announcements
  getAnnouncements: async (associationId: string) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }

    return data as Announcement[];
  },

  createAnnouncement: async (announcement: Partial<Announcement>) => {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }

    return data as Announcement;
  },

  updateAnnouncement: async (id: string, announcement: Partial<Announcement>) => {
    const { data, error } = await supabase
      .from('announcements')
      .update(announcement)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }

    return data as Announcement;
  },

  deleteAnnouncement: async (id: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // Recipient Groups
  getRecipientGroups: async (associationId: string) => {
    const { data, error } = await supabase
      .from('recipient_groups')
      .select('*')
      .eq('association_id', associationId)
      .order('name');

    if (error) {
      console.error('Error fetching recipient groups:', error);
      throw error;
    }

    return data as RecipientGroup[];
  },
  
  // Get all recipient groups across multiple associations
  getRecipientGroupsForAssociations: async (associationIds: string[]) => {
    if (!associationIds || associationIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('recipient_groups')
      .select('*')
      .in('association_id', associationIds)
      .order('name');

    if (error) {
      console.error('Error fetching recipient groups for associations:', error);
      throw error;
    }

    return data as RecipientGroup[];
  },
  
  getAllAssociations: async () => {
    const { data, error } = await supabase
      .rpc('get_user_associations');

    if (error) {
      console.error('Error fetching associations:', error);
      throw error;
    }

    return data || [];
  },
  
  // Send a message to recipients
  sendMessage: async (message: {
    subject: string;
    content: string;
    association_id: string;
    recipient_groups: string[];
    type: 'email' | 'sms';
  }) => {
    // In a real implementation, this would connect to email/SMS services
    // For now, we'll just simulate success
    console.log('Sending message:', message);
    
    toast.success(`Message "${message.subject}" sent successfully`);
    return { success: true, message: 'Message sent successfully' };
  }
};
