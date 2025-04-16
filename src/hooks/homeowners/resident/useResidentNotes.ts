
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

      const { data: notesData, error: notesError } = await supabase
        .from('comments')
        .select('*')
        .eq('parent_id', residentId)
        .eq('parent_type', 'resident')
        .order('created_at', { ascending: false });
        
      if (notesError) {
        console.error('Error fetching resident notes:', notesError);
        setError('Failed to fetch notes');
      } else {
        // Convert database comments to NoteType format
        const formattedNotes: NoteType[] = notesData?.map(formatCommentAsNote) || [];
        console.log('Fetched notes:', formattedNotes);
        setNotes(formattedNotes);
      }
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
      
      // Add note to the database comments table
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      const { error, data } = await supabase
        .from('comments')
        .insert({
          parent_id: residentId,
          parent_type: 'resident',
          user_id: userId || null,
          user_name: noteData.author,
          content: noteData.type === 'system' ? `[SYSTEM] ${noteData.content}` : noteData.content,
        })
        .select();
        
      if (error) {
        console.error("Error adding note to database:", error);
        throw new Error('Failed to add note to database');
      }
      
      console.log("Note added successfully:", data);
      
      // Refresh notes from database
      await fetchNotes();
      
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
