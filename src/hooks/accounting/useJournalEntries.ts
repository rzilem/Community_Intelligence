
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JournalEntry } from '@/types/accounting-types';

export interface JournalEntryDetail {
  id?: string;
  journal_entry_id?: string;
  gl_account_id: string;
  description?: string;
  debit: number;
  credit: number;
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
      
      // Map to match the JournalEntry interface
      return (data || []).map(entry => ({
        id: entry.id,
        entryNumber: entry.entry_number,
        entryDate: entry.date,
        date: entry.date, // For compatibility
        reference: entry.reference || entry.entry_number, // For compatibility
        description: entry.description,
        status: entry.status as JournalEntry['status'],
        associationId: entry.association_id,
        createdBy: entry.created_by,
        createdAt: entry.created_at,
        updatedAt: entry.created_at,  // Placeholder if updated_at is not available
        amount: 0, // We'll populate this with details later
      }));
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
      
      // Map to match our interface
      const mappedEntry: JournalEntry = {
        id: entry.id,
        entryNumber: entry.entry_number,
        entryDate: entry.date,
        date: entry.date, // For compatibility
        reference: entry.reference || entry.entry_number, // For compatibility
        description: entry.description,
        status: entry.status as JournalEntry['status'],
        associationId: entry.association_id,
        createdBy: entry.created_by,
        createdAt: entry.created_at,
        updatedAt: entry.created_at, // Placeholder
        amount: calculateTotalAmount(details || []),
        details: details || []
      };
      
      return mappedEntry;
    } catch (error) {
      console.error('Error fetching journal entry with details:', error);
      throw error;
    }
  };

  // Calculate total amount from details
  const calculateTotalAmount = (details: JournalEntryDetail[]): number => {
    return details.reduce((sum, detail) => sum + (Number(detail.debit) || 0), 0);
  };

  // Create journal entry
  const createJournalEntry = useMutation({
    mutationFn: async (journalEntry: JournalEntry) => {
      try {
        // Insert journal entry
        const { data: entry, error: entryError } = await supabase
          .from('journal_entries')
          .insert({
            entry_number: journalEntry.entryNumber,
            date: journalEntry.entryDate,
            reference: journalEntry.reference,
            description: journalEntry.description,
            status: journalEntry.status,
            association_id: journalEntry.associationId
          })
          .select('id')
          .single();
        
        if (entryError) throw entryError;
        
        // Insert journal entry details
        if (journalEntry.details && journalEntry.details.length > 0) {
          const details = journalEntry.details.map(detail => ({
            journal_entry_id: entry.id,
            gl_account_id: detail.gl_account_id,
            description: detail.description,
            debit: detail.debit,
            credit: detail.credit
          }));
          
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
