
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/communication-types';

export const communicationService = {
  
  // Get all associations the user has access to
  getAllAssociations: async () => {
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching associations:', error);
      return [];
    }
  },
  
  // Get a specific association by ID
  getAssociationById: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('*')
        .eq('id', associationId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching association with ID ${associationId}:`, error);
      return null;
    }
  },
  
  // Get recipient groups for a specific association
  getRecipientGroups: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('recipient_groups')
        .select('*')
        .eq('association_id', associationId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recipient groups:', error);
      return [];
    }
  },
  
  // Get recipient groups for multiple associations
  getRecipientGroupsForAssociations: async (associationIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('recipient_groups')
        .select('*')
        .in('association_id', associationIds)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recipient groups for multiple associations:', error);
      return [];
    }
  },
  
  // Send a message
  sendMessage: async (messageData: {
    subject: string;
    content: string;
    association_id: string;
    recipient_groups: string[];
    type: 'email' | 'sms';
  }) => {
    try {
      // This is a placeholder for the actual API call
      console.log('Sending message:', messageData);
      
      // Simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get announcements for an association
  getAnnouncements: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  // Create a new announcement
  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([announcement])
        .select();
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Update an existing announcement
  updateAnnouncement: async (id: string, updates: Partial<Announcement>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  // Delete an announcement
  deleteAnnouncement: async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }
};
