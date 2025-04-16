
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/communication-types';

export const announcementService = {
  // Get announcements for an association
  getAnnouncements: async (associationId: string): Promise<Announcement[]> => {
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
  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement | null> => {
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
  updateAnnouncement: async (id: string, updates: Partial<Announcement>): Promise<Announcement | null> => {
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
  deleteAnnouncement: async (id: string): Promise<boolean> => {
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
