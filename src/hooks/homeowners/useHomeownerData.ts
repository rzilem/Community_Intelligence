
import { useState, useEffect } from 'react';
import { Homeowner } from '@/components/homeowners/detail/types';
import { useResidentData } from './resident/useResidentData';
import { useResidentNotes } from './resident/useResidentNotes';
import { useResidentImage } from './resident/useResidentImage';

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
    addNote
  } = useResidentNotes(homeownerId);

  const { avatarUrl, updateResidentImage } = useResidentImage();

  // Combine the data from the separate hooks
  const [homeowner, setHomeowner] = useState<Homeowner>(resident);
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
    return addNote(noteData);
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

// Need to import NoteType for the addHomeownerNote function parameter
import { NoteType } from '@/components/homeowners/detail/types';
