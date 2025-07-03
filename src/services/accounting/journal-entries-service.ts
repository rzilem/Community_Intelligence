import { supabase } from "@/integrations/supabase/client";
import { GLAccountsService } from "./gl-accounts-service";
import type { Database } from "@/integrations/supabase/types";

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
type JournalEntryLine = Database['public']['Tables']['journal_entry_lines']['Row'];
type JournalEntryLineInsert = Database['public']['Tables']['journal_entry_lines']['Insert'];

export interface JournalEntryWithLines extends JournalEntry {
  lines: (JournalEntryLine & {
    gl_account: {
      account_code: string;
      account_name: string;
    };
  })[];
}

export interface JournalEntryFormData {
  entry_date: string;
  description: string;
  reference_number?: string;
  source_type: string;
  lines: {
    gl_account_id: string;
    description?: string;
    debit_amount?: number;
    credit_amount?: number;
    property_id?: string;
    vendor_id?: string;
  }[];
}

export class JournalEntriesService {
  // Fetch journal entries for an association
  static async getJournalEntries(associationId: string, status?: string): Promise<JournalEntryWithLines[]> {
    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_entry_lines(
          *,
          gl_account:gl_accounts_enhanced(account_code, account_name)
        )
      `)
      .eq('association_id', associationId)
      .order('entry_date', { ascending: false })
      .order('entry_number', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data as JournalEntryWithLines[];
  }

  // Create a new journal entry with validation
  static async createJournalEntry(associationId: string, entryData: JournalEntryFormData): Promise<JournalEntry> {
    // Validate double-entry bookkeeping
    this.validateDoubleEntry(entryData.lines);

    // Generate entry number
    const entryNumber = await this.generateEntryNumber(associationId);

    // Calculate total amount
    const totalAmount = entryData.lines.reduce((sum, line) => 
      sum + (line.debit_amount || 0), 0
    );

    // Create journal entry
    const journalEntry: JournalEntryInsert = {
      association_id: associationId,
      entry_number: entryNumber,
      entry_date: entryData.entry_date,
      description: entryData.description,
      reference_number: entryData.reference_number,
      source_type: entryData.source_type as any,
      total_amount: totalAmount,
      status: 'draft'
    };

    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert(journalEntry)
      .select()
      .single();

    if (entryError) throw entryError;

    // Create journal entry lines
    const lines: JournalEntryLineInsert[] = entryData.lines.map((line, index) => ({
      journal_entry_id: entry.id,
      line_number: index + 1,
      gl_account_id: line.gl_account_id,
      description: line.description,
      debit_amount: line.debit_amount || 0,
      credit_amount: line.credit_amount || 0,
      property_id: line.property_id,
      vendor_id: line.vendor_id
    }));

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(lines);

    if (linesError) throw linesError;

    return entry;
  }

  // Post a journal entry (make it final and update account balances)
  static async postJournalEntry(entryId: string): Promise<void> {
    // Get the journal entry with lines
    const { data: entry, error: fetchError } = await supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_entry_lines(*)
      `)
      .eq('id', entryId)
      .single();

    if (fetchError) throw fetchError;
    if (!entry) throw new Error('Journal entry not found');
    if (entry.status === 'posted') throw new Error('Journal entry already posted');

    // Validate balances again
    this.validateDoubleEntry(entry.lines);

    // Update account balances
    for (const line of entry.lines) {
      if (line.debit_amount && line.debit_amount > 0) {
        await GLAccountsService.updateAccountBalance(line.gl_account_id, line.debit_amount, true);
      }
      if (line.credit_amount && line.credit_amount > 0) {
        await GLAccountsService.updateAccountBalance(line.gl_account_id, line.credit_amount, false);
      }
    }

    // Update journal entry status
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({ 
        status: 'posted',
        posted_at: new Date().toISOString()
      })
      .eq('id', entryId);

    if (updateError) throw updateError;
  }

  // Reverse a journal entry
  static async reverseJournalEntry(entryId: string, reason: string): Promise<JournalEntry> {
    // Get the original journal entry with lines
    const { data: originalEntry, error: fetchError } = await supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_entry_lines(*)
      `)
      .eq('id', entryId)
      .single();

    if (fetchError) throw fetchError;
    if (!originalEntry) throw new Error('Journal entry not found');
    if (originalEntry.status !== 'posted') throw new Error('Can only reverse posted entries');

    // Create reversing entry
    const reversingLines = originalEntry.lines.map(line => ({
      gl_account_id: line.gl_account_id,
      description: `Reversal: ${line.description || ''}`,
      debit_amount: line.credit_amount || 0,  // Swap debits and credits
      credit_amount: line.debit_amount || 0,
      property_id: line.property_id,
      vendor_id: line.vendor_id
    }));

    const reversingEntryData: JournalEntryFormData = {
      entry_date: new Date().toISOString().split('T')[0],
      description: `Reversal of ${originalEntry.entry_number}: ${reason}`,
      reference_number: originalEntry.entry_number,
      source_type: 'adjustment',
      lines: reversingLines
    };

    // Create and post the reversing entry
    const reversingEntry = await this.createJournalEntry(originalEntry.association_id, reversingEntryData);
    await this.postJournalEntry(reversingEntry.id);

    // Mark original entry as reversed
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({ 
        status: 'reversed',
        reversed_at: new Date().toISOString(),
        reversal_reason: reason
      })
      .eq('id', entryId);

    if (updateError) throw updateError;

    return reversingEntry;
  }

  // Delete a draft journal entry
  static async deleteJournalEntry(entryId: string): Promise<void> {
    const { data: entry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('status')
      .eq('id', entryId)
      .single();

    if (fetchError) throw fetchError;
    if (entry.status !== 'draft') throw new Error('Can only delete draft entries');

    // Delete lines first (cascade should handle this, but being explicit)
    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .delete()
      .eq('journal_entry_id', entryId);

    if (linesError) throw linesError;

    // Delete entry
    const { error: entryError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    if (entryError) throw entryError;
  }

  // Generate next entry number
  private static async generateEntryNumber(associationId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `JE-${currentYear}-`;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .eq('association_id', associationId)
      .like('entry_number', `${prefix}%`)
      .order('entry_number', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].entry_number;
      const lastSequence = parseInt(lastNumber.split('-').pop() || '0');
      nextNumber = lastSequence + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  // Validate double-entry bookkeeping rules
  private static validateDoubleEntry(lines: any[]): void {
    if (lines.length < 2) {
      throw new Error('Journal entry must have at least 2 lines');
    }

    const totalDebits = lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(`Debits (${totalDebits}) must equal credits (${totalCredits})`);
    }

    // Check that each line has either debit or credit, but not both
    for (const line of lines) {
      const hasDebit = (line.debit_amount || 0) > 0;
      const hasCredit = (line.credit_amount || 0) > 0;
      
      if (hasDebit && hasCredit) {
        throw new Error('Each line can have either debit or credit, not both');
      }
      if (!hasDebit && !hasCredit) {
        throw new Error('Each line must have either debit or credit amount');
      }
    }
  }

  // Get journal entry by ID with lines
  static async getJournalEntryById(entryId: string): Promise<JournalEntryWithLines | null> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_entry_lines(
          *,
          gl_account:gl_accounts_enhanced(account_code, account_name)
        )
      `)
      .eq('id', entryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as JournalEntryWithLines;
  }
}
