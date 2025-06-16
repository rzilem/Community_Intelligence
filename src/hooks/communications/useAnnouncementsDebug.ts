
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Announcement, AnnouncementPriority } from '@/types/communication-types';
import { toast } from 'sonner';

export const useAnnouncementsDebug = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Debug function to log state
  const logDebugInfo = () => {
    console.log('[useAnnouncementsDebug] Current state:', {
      announcementsCount: announcements.length,
      isLoading,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  };

  // Fetch announcements with debugging
  const fetchAnnouncements = async () => {
    console.log('[useAnnouncementsDebug] Starting fetch...');
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[useAnnouncementsDebug] Fetch result:', { data, error });

      if (error) {
        throw new Error(error.message);
      }

      // Type cast the data to match our Announcement interface
      const typedData = data?.map(item => ({
        ...item,
        priority: (item.priority || 'normal') as AnnouncementPriority
      })) || [];
      
      console.log('[useAnnouncementsDebug] Processed data:', typedData);
      setAnnouncements(typedData);
    } catch (error: any) {
      console.error('[useAnnouncementsDebug] Error fetching announcements:', error);
      setError(error);
      toast.error(`Failed to load announcements: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('[useAnnouncementsDebug] Fetch completed');
    }
  };

  // Create a new announcement with debugging
  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('[useAnnouncementsDebug] Creating announcement:', announcement);
    
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([announcement])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Type cast to ensure priority is of type AnnouncementPriority
      const typedData = {
        ...data,
        priority: data.priority as AnnouncementPriority
      };

      setAnnouncements((prev) => [typedData, ...prev]);
      toast.success('Announcement created successfully');
      console.log('[useAnnouncementsDebug] Announcement created:', typedData);
      return typedData;
    } catch (error: any) {
      console.error('[useAnnouncementsDebug] Error creating announcement:', error);
      toast.error(`Failed to create announcement: ${error.message}`);
      throw error;
    }
  };

  // Update an announcement with debugging
  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    console.log('[useAnnouncementsDebug] Updating announcement:', { id, updates });
    
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

      // Type cast to ensure priority is of type AnnouncementPriority
      const typedData = {
        ...data,
        priority: data.priority as AnnouncementPriority
      };

      setAnnouncements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...typedData } : item))
      );
      toast.success('Announcement updated successfully');
      console.log('[useAnnouncementsDebug] Announcement updated:', typedData);
      return typedData;
    } catch (error: any) {
      console.error('[useAnnouncementsDebug] Error updating announcement:', error);
      toast.error(`Failed to update announcement: ${error.message}`);
      throw error;
    }
  };

  // Delete an announcement with debugging
  const deleteAnnouncement = async (id: string) => {
    console.log('[useAnnouncementsDebug] Deleting announcement:', id);
    
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
      console.log('[useAnnouncementsDebug] Announcement deleted:', id);
    } catch (error: any) {
      console.error('[useAnnouncementsDebug] Error deleting announcement:', error);
      toast.error(`Failed to delete announcement: ${error.message}`);
      throw error;
    }
  };

  // Load announcements on component mount
  useEffect(() => {
    console.log('[useAnnouncementsDebug] Hook initialized, fetching announcements...');
    fetchAnnouncements();
  }, []);

  // Log debug info whenever state changes
  useEffect(() => {
    logDebugInfo();
  }, [announcements, isLoading, error]);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    logDebugInfo
  };
};
