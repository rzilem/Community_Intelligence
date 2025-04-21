
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Homeowner, NoteType } from '@/components/homeowners/detail/types';
import { toast } from 'sonner';

export const useHomeownerData = (homeownerId: string) => {
  const [homeowner, setHomeowner] = useState<Homeowner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load homeowner data
  const loadHomeownerData = useCallback(async () => {
    if (!homeownerId) {
      setLoading(false);
      setError('No homeowner ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // This is a mock implementation - in a real app, this would fetch from your API
      // For demo purposes, we're just simulating a response
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data for homeowner
      const mockHomeowner: Homeowner = {
        id: homeownerId,
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(512) 555-1234',
        moveInDate: '2021-06-15',
        property: '123 Main Street',
        unit: 'Apt 4B',
        balance: '150.00',
        status: 'Active',
        tags: ['Resident', 'Board Member'],
        violations: 0,
        lastContact: {
          email: '2023-09-15T14:30:00Z',
          called: '2023-08-20T10:15:00Z',
          visit: '2023-07-05T16:45:00Z'
        },
        lastLoginDate: '2023-10-10T08:22:15Z',
        notes: [
          {
            id: '1',
            content: 'Requested information about pool hours',
            author: 'Jane Doe',
            date: '2023-09-15T14:30:00Z',
            type: 'manual'
          },
          {
            id: '2',
            content: 'Submitted maintenance request for broken window',
            author: 'System',
            date: '2023-08-10T09:45:00Z',
            type: 'system'
          }
        ]
      };

      setHomeowner(mockHomeowner);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading homeowner data:', err);
      setError(err.message || 'Failed to load homeowner data');
      setLoading(false);
    }
  }, [homeownerId]);

  // Load data on initial render
  useState(() => {
    loadHomeownerData();
  });

  // Function to update homeowner avatar
  const updateHomeownerImage = useCallback(async (imageUrl: string) => {
    if (!homeownerId) return;
    
    try {
      // This would be an API call in a real implementation
      console.log('Updating homeowner image:', { homeownerId, imageUrl });
      
      setHomeowner(prev => prev ? { ...prev, avatarUrl: imageUrl } : null);
      return true;
    } catch (err: any) {
      console.error('Error updating homeowner image:', err);
      toast.error('Failed to update profile image');
      return false;
    }
  }, [homeownerId]);

  // Function to update homeowner data
  const updateHomeownerData = useCallback(async (data: Partial<Homeowner>) => {
    if (!homeownerId) return;
    
    try {
      // This would be an API call in a real implementation
      console.log('Updating homeowner data:', { homeownerId, data });
      
      setHomeowner(prev => prev ? { ...prev, ...data } : null);
      toast.success('Homeowner information updated');
      return true;
    } catch (err: any) {
      console.error('Error updating homeowner data:', err);
      toast.error('Failed to update homeowner information');
      return false;
    }
  }, [homeownerId]);

  // Function to add a note
  const addHomeownerNote = useCallback(async (note: Omit<NoteType, 'date'>) => {
    if (!homeownerId) return;
    
    try {
      // This would be an API call in a real implementation
      console.log('Adding homeowner note:', { homeownerId, note });
      
      // Create a new note with the current date
      const newNote: NoteType = {
        ...note,
        id: Date.now().toString(), // This would be assigned by the server in a real implementation
        date: new Date().toISOString()
      };
      
      setHomeowner(prev => {
        if (!prev) return null;
        
        const updatedNotes = [...(prev.notes || []), newNote];
        return { ...prev, notes: updatedNotes };
      });
      
      toast.success('Note added successfully');
      return true;
    } catch (err: any) {
      console.error('Error adding homeowner note:', err);
      toast.error('Failed to add note');
      return false;
    }
  }, [homeownerId]);

  // Function to add a system note for login events
  const addSystemLoginNote = useCallback(async (message: string) => {
    if (!homeownerId) return;
    
    try {
      // This would be an API call in a real implementation
      console.log('Adding login system note:', { homeownerId, message });
      
      const systemNote: NoteType = {
        content: message,
        author: 'System',
        date: new Date().toISOString(),
        type: 'system'
      };
      
      // Update the homeowner's lastLoginDate
      const updatedHomeowner = {
        ...homeowner,
        lastLoginDate: new Date().toISOString(),
        notes: [...(homeowner?.notes || []), systemNote]
      };
      
      setHomeowner(updatedHomeowner);
      return true;
    } catch (err: any) {
      console.error('Error adding login system note:', err);
      return false;
    }
  }, [homeownerId, homeowner]);

  return {
    homeowner,
    loading,
    error,
    updateHomeownerImage,
    updateHomeownerData,
    addHomeownerNote,
    addSystemLoginNote,
    refreshData: loadHomeownerData
  };
};
