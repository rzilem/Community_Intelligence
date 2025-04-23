
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { JournalEntry } from '@/types/accounting-types';
import { mockJournalEntries } from './mock/mockJournalEntries';

export interface JournalEntryDetail {
  id?: string;
  journal_entry_id?: string;
  gl_account_id: string;
  description?: string;
  debit: number;
  credit: number;
}

// Mock implementation of getJournalEntryDetails
const getMockJournalEntryDetails = (entryId: string): JournalEntryDetail[] => {
  // Create some mock details
  return [
    {
      id: `detail-1-${entryId}`,
      journal_entry_id: entryId,
      gl_account_id: '1',
      description: 'Cash payment',
      debit: 1000,
      credit: 0
    },
    {
      id: `detail-2-${entryId}`,
      journal_entry_id: entryId,
      gl_account_id: '6',
      description: 'Expense payment',
      debit: 0,
      credit: 1000
    }
  ];
};

export const useJournalEntries = (associationId?: string) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  // Use mock data instead of fetching from Supabase
  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['journalEntries', associationId, filter],
    queryFn: async () => {
      // Filter the mock entries based on the associationId and filter criteria
      let filteredEntries = [...mockJournalEntries];
      
      if (associationId) {
        filteredEntries = filteredEntries.filter(entry => entry.associationId === associationId);
      }
      
      if (filter !== 'all') {
        filteredEntries = filteredEntries.filter(entry => entry.status === filter);
      }
      
      return filteredEntries;
    },
    enabled: true // Changed from !!associationId to always enable the query
  });

  // Fetch journal entry details (mock implementation)
  const getJournalEntryWithDetails = async (entryId: string) => {
    try {
      // Find the entry in our mock data
      const entry = mockJournalEntries.find(e => e.id === entryId);
      
      if (!entry) {
        throw new Error('Journal entry not found');
      }
      
      // Get mock details
      const details = getMockJournalEntryDetails(entryId);
      
      // Return the combined entry with details
      return {
        ...entry,
        details
      };
    } catch (error) {
      console.error('Error fetching journal entry with details:', error);
      throw error;
    }
  };

  // Calculate total amount from details
  const calculateTotalAmount = (details: JournalEntryDetail[]): number => {
    return details.reduce((sum, detail) => sum + (Number(detail.debit) || 0), 0);
  };

  // Create journal entry (mock implementation)
  const createJournalEntry = useMutation({
    mutationFn: async (journalEntry: JournalEntry) => {
      try {
        // In a real implementation, this would insert data into Supabase
        console.log('Creating journal entry:', journalEntry);
        
        // Mock successful creation by returning a new ID
        return { id: `mock-${Date.now()}` };
      } catch (error) {
        console.error('Error creating journal entry:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Journal entry created successfully');
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
    onError: (error) => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    }
  });

  // Update journal entry status (mock implementation)
  const updateJournalEntryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      try {
        // In a real implementation, this would update data in Supabase
        console.log(`Updating journal entry ${id} status to ${status}`);
        
        // Mock successful update
        return { id, status };
      } catch (error) {
        console.error('Error updating journal entry status:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`Journal entry ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
    onError: (error) => {
      toast.error(`Failed to update journal entry: ${error.message}`);
    }
  });

  return {
    entries,
    isLoading,
    error,
    filter,
    setFilter,
    getJournalEntryWithDetails,
    createJournalEntry,
    updateJournalEntryStatus
  };
};
