
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/communication-types';
import { toast } from 'sonner';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setAnnouncements(data || []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new announcement
  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([announcement])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setAnnouncements((prev) => [data, ...prev]);
      toast.success('Announcement created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast.error(`Failed to create announcement: ${error.message}`);
      throw error;
    }
  };

  // Update an announcement
  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setAnnouncements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
      toast.success('Announcement updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      toast.error(`Failed to update announcement: ${error.message}`);
      throw error;
    }
  };

  // Delete an announcement
  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
      toast.success('Announcement deleted successfully');
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast.error(`Failed to delete announcement: ${error.message}`);
      throw error;
    }
  };

  // Load announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  };
};
