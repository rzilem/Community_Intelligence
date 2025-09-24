// Mock implementation for communication service

export const announcementService = {
  getAnnouncements: async (associationId: string) => {
    console.log('MOCK: Getting announcements for', associationId);
    return [
      {
        id: '1',
        title: 'Pool Closure Notice',
        content: 'The community pool will be closed for maintenance next week.',
        association_id: associationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_urgent: false,
        status: 'published',
        priority: 'medium'
      }
    ];
  },

  createAnnouncement: async (data: any) => {
    console.log('MOCK: Creating announcement', data);
    return {
      id: Math.random().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  updateAnnouncement: async (id: string, data: any) => {
    console.log('MOCK: Updating announcement', id, data);
    return {
      id,
      ...data,
      updated_at: new Date().toISOString()
    };
  },

  deleteAnnouncement: async (id: string) => {
    console.log('MOCK: Deleting announcement', id);
    return true;
  }
};