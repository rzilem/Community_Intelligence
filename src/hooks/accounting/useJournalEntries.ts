
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JournalEntryDetail {
  id?: string;
  journal_entry_id?: string;
  gl_account_id: string;
  description?: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id?: string;
  entry_number?: string;
  date: string;
  reference?: string;
  description?: string;
  status: 'draft' | 'posted' | 'reconciled';
  association_id: string;
  details: JournalEntryDetail[];
}

export const useJournalEntries = (associationId?: string) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  // Fetch journal entries
  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['journalEntries', associationId, filter],
    queryFn: async () => {
      let query = supabase
        .from('journal_entries')
        .select(`
          id, 
          entry_number, 
          date,
          reference, 
          description,
          status,
          created_at,
          association_id,
          created_by
        `)
        .order('date', { ascending: false });
        
      if (associationId) {
        query = query.eq('association_id', associationId);
      }
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!associationId
  });

  // Fetch journal entry details
  const getJournalEntryWithDetails = async (entryId: string) => {
    try {
      // Fetch journal entry
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .select(`
          id, 
          entry_number, 
          date,
          reference, 
          description,
          status,
          created_at,
          association_id,
          created_by
        `)
        .eq('id', entryId)
        .single();
      
      if (entryError) throw entryError;
      
      // Fetch journal entry details
      const { data: details, error: detailsError } = await supabase
        .from('journal_entry_details')
        .select(`
          id,
          journal_entry_id,
          gl_account_id,
          description,
          debit,
          credit
        `)
        .eq('journal_entry_id', entryId);
      
      if (detailsError) throw detailsError;
      
      return { ...entry, details: details || [] };
    } catch (error) {
      console.error('Error fetching journal entry with details:', error);
      throw error;
    }
  };

  // Create journal entry
  const createJournalEntry = useMutation({
    mutationFn: async (journalEntry: JournalEntry) => {
      try {
        // Insert journal entry
        const { data: entry, error: entryError } = await supabase
          .from('journal_entries')
          .insert({
            date: journalEntry.date,
            reference: journalEntry.reference,
            description: journalEntry.description,
            status: journalEntry.status,
            association_id: journalEntry.association_id
          })
          .select('id')
          .single();
        
        if (entryError) throw entryError;
        
        // Insert journal entry details
        const details = journalEntry.details.map(detail => ({
          journal_entry_id: entry.id,
          gl_account_id: detail.gl_account_id,
          description: detail.description,
          debit: detail.debit,
          credit: detail.credit
        }));
        
        if (details.length > 0) {
          const { error: detailsError } = await supabase
            .from('journal_entry_details')
            .insert(details);
          
          if (detailsError) throw detailsError;
        }
        
        return entry;
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

  // Update journal entry status
  const updateJournalEntryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('journal_entries')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      return { id, status };
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
