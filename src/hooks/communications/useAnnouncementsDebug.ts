import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string | null;
  priority: string;
  association_id: string;
  author_id: string;
  is_published: boolean;
  publish_date: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateAnnouncementData {
  title: string;
  content: string;
  priority: string;
  association_id: string;
  author_id: string;
  is_published: boolean;
  publish_date: string;
  expiry_date: string | null;
}

export const useAnnouncementsDebug = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mock data
  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'Pool Maintenance Notice',
      content: 'The community pool will be closed for maintenance on Monday.',
      priority: 'normal',
      association_id: 'mock-association-1',
      author_id: 'mock-user-1',
      is_published: true,
      publish_date: new Date().toISOString(),
      expiry_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'HOA Meeting Reminder',
      content: 'Monthly HOA meeting this Thursday at 7 PM in the clubhouse.',
      priority: 'high',
      association_id: 'mock-association-1',
      author_id: 'mock-user-1',
      is_published: true,
      publish_date: new Date().toISOString(),
      expiry_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const fetchAnnouncements = async () => {
    console.log('[useAnnouncementsDebug] Fetching announcements...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnnouncements(mockAnnouncements);
      console.log('[useAnnouncementsDebug] Announcements fetched successfully:', mockAnnouncements.length);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch announcements');
      console.error('[useAnnouncementsDebug] Error fetching announcements:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAnnouncement = async (data: CreateAnnouncementData) => {
    console.log('[useAnnouncementsDebug] Creating announcement:', data);
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAnnouncement: Announcement = {
        ...data,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast.success('Announcement created successfully!');
      console.log('[useAnnouncementsDebug] Announcement created:', newAnnouncement);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create announcement');
      console.error('[useAnnouncementsDebug] Error creating announcement:', error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logDebugInfo = () => {
    console.log('[useAnnouncementsDebug] Debug Info:', {
      announcementsCount: announcements.length,
      isLoading,
      error: error?.message,
      announcements: announcements.map(a => ({
        id: a.id,
        title: a.title,
        priority: a.priority,
        created_at: a.created_at
      }))
    });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    logDebugInfo
  };
};