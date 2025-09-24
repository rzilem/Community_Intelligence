
import { useState, useEffect } from 'react';
import { NoteType } from '@/components/homeowners/detail/types';
import { supabase } from '@/integrations/supabase/client';
import { formatCommentAsNote } from './residentUtils';

export const useResidentNotes = (residentId: string) => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      if (!residentId) {
        setNotes([]);
        setLoading(false);
        return;
      }

      // Mock notes data since comments table doesn't exist
      const mockNotes: NoteType[] = [
        {
          content: 'Sample note for this resident',
          author: 'System',
          date: new Date().toISOString(),
          type: 'system'
        }
      ];
      
      console.log('Fetched mock notes:', mockNotes);
      setNotes(mockNotes);
      setError(null);
    } catch (err) {
      console.error('Error fetching resident notes:', err);
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [residentId]);

  const addNote = async (noteData: Omit<NoteType, 'date'>) => {
    try {
      if (!residentId) {
        throw new Error('Cannot add note: Missing resident ID');
      }
      
      // Mock note addition since comments table doesn't exist
      const newNote: NoteType = {
        content: noteData.content,
        author: noteData.author,
        date: new Date().toISOString(),
        type: noteData.type
      };
      
      console.log("Mock note added successfully:", newNote);
      
      // Add to current notes list
      setNotes(prev => [newNote, ...prev]);
      
      return true;
    } catch (err) {
      console.error("Error adding homeowner note:", err);
      throw new Error('Failed to add homeowner note');
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    fetchNotes
  };
};
