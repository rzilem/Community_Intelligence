import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  association_id: string;
  title: string;
  content: string;
  author_id: string;
  priority: AnnouncementPriority;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch announcements using mock data
  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      // Use mock data since announcements table doesn't exist
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          association_id: 'default-association',
          title: 'Pool Maintenance Scheduled',
          content: 'The community pool will be closed for maintenance on September 30th from 9 AM to 5 PM.',
          author_id: 'admin1',
          priority: 'normal',
          published_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          association_id: 'default-association',
          title: 'Board Meeting Notice',
          content: 'The monthly board meeting will be held on October 5th at 7 PM in the community center.',
          author_id: 'admin1',
          priority: 'high',
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setAnnouncements(mockAnnouncements);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setError(error);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new announcement
  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Mock create announcement
      const newAnnouncement: Announcement = {
        ...announcement,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast.success('Announcement created successfully');
      return newAnnouncement;
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
      throw error;
    }
  };

  // Update an announcement
  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    try {
      // Mock update announcement
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      setAnnouncements(prev => prev.map(announcement => 
        announcement.id === id ? { ...announcement, ...updatedData } : announcement
      ));
      
      toast.success('Announcement updated successfully');
      return updatedData;
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
      throw error;
    }
  };

  // Delete an announcement
  const deleteAnnouncement = async (id: string) => {
    try {
      // Mock delete announcement
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
      toast.success('Announcement deleted successfully');
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
      throw error;
    }
  };

  // Load announcements on mount
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
    deleteAnnouncement,
  };
};