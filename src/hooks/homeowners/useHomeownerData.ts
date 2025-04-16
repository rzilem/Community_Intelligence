
import { useState, useEffect } from 'react';
import { Homeowner } from '@/components/homeowners/detail/types';
import { useResidentData } from './resident/useResidentData';
import { useResidentNotes } from './resident/useResidentNotes';
import { useResidentImage } from './resident/useResidentImage';
import { NoteType } from '@/components/homeowners/detail/types';

export const useHomeownerData = (homeownerId: string) => {
  const {
    resident,
    loading: residentLoading,
    error: residentError,
    updateResidentData
  } = useResidentData(homeownerId);

  const {
    notes,
    loading: notesLoading,
    error: notesError,
    addNote,
    fetchNotes
  } = useResidentNotes(homeownerId);

  const { avatarUrl, updateResidentImage } = useResidentImage();

  // Combine the data from the separate hooks
  const [homeowner, setHomeowner] = useState<Homeowner>({} as Homeowner);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update homeowner with resident data when it changes
    setHomeowner(prev => ({
      ...prev,
      ...resident,
      notes
    }));

    // Determine overall loading state
    setLoading(residentLoading || notesLoading);

    // Determine overall error state
    if (residentError) {
      setError(residentError);
    } else if (notesError) {
      setError(notesError);
    } else {
      setError(null);
    }
  }, [resident, notes, residentLoading, notesLoading, residentError, notesError]);

  const addHomeownerNote = async (noteData: Omit<NoteType, 'date'>) => {
    try {
      const result = await addNote(noteData);
      // Force a refresh of the notes after adding a new one
      await fetchNotes();
      console.log("Note added and refreshed");
      return result;
    } catch (error) {
      console.error("Error in addHomeownerNote:", error);
      throw error;
    }
  };

  const updateHomeownerImage = (newUrl: string) => {
    updateResidentImage(newUrl);
  };

  const updateHomeownerData = async (data: Partial<Homeowner>) => {
    return updateResidentData(data);
  };

  return {
    homeowner,
    loading,
    error,
    updateHomeownerImage,
    updateHomeownerData,
    addHomeownerNote
  };
};
