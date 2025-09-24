// Mock implementation for announcement service

export interface Announcement {
  id: string;
  title: string;
  content: string;
  association_id: string;
  created_at: string;
  updated_at: string;
  is_urgent: boolean;
  status: 'draft' | 'published' | 'archived';
}

export async function getAnnouncements(associationId: string): Promise<Announcement[]> {
  console.log('=== MOCK: Fetching announcements ===', associationId);
  
  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'Pool Closure Notice',
      content: 'The community pool will be closed for maintenance next week.',
      association_id: associationId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_urgent: false,
      status: 'published'
    }
  ];

  return mockAnnouncements;
}

export async function createAnnouncement(announcementData: Partial<Announcement>): Promise<Announcement> {
  console.log('=== MOCK: Creating announcement ===', announcementData);
  
  const mockAnnouncement: Announcement = {
    id: Math.random().toString(),
    title: announcementData.title || 'New Announcement',
    content: announcementData.content || '',
    association_id: announcementData.association_id || '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_urgent: announcementData.is_urgent || false,
    status: announcementData.status || 'draft'
  };

  return mockAnnouncement;
}