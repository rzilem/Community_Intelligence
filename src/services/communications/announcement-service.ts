
import { supabase } from '@/integrations/supabase/client';
import { Announcement, AnnouncementPriority } from '@/types/communication-types';
import { toast } from 'sonner';

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
      
      // Ensure the data is properly typed
      return (data || []).map(item => ({
        ...item,
        priority: item.priority as AnnouncementPriority
      })) as Announcement[];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },
  
  // Create a new announcement
  createAnnouncement: async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement | null> => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcementData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Ensure the returned data is properly typed
      return {
        ...data,
        priority: data.priority as AnnouncementPriority
      } as Announcement;
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
      return null;
    }
  },
  
  // Update an existing announcement
  updateAnnouncement: async (id: string, announcementData: Partial<Announcement>): Promise<Announcement | null> => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .update({
          ...announcementData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Ensure the returned data is properly typed
      return {
        ...data,
        priority: data.priority as AnnouncementPriority
      } as Announcement;
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
      return null;
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
      toast.error('Failed to delete announcement');
      return false;
    }
  }
};
