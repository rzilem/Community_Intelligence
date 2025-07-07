import { supabase } from '@/integrations/supabase/client';

export interface RecurringJournalEntry {
  id: string;
  name: string;
  description: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  next_run_date: string;
  is_active: boolean;
  line_items: Array<{
    gl_account_id: string;
    debit_amount?: number;
    credit_amount?: number;
    description: string;
  }>;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger_type: 'schedule' | 'event' | 'condition';
  conditions: any;
  actions: any;
  is_active: boolean;
}

export class AutomationService {
  
  static async createRecurringJournalEntry(
    associationId: string,
    data: Omit<RecurringJournalEntry, 'id'>
  ): Promise<string> {
    const { data: entry, error } = await supabase
      .from('recurring_journal_entries')
      .insert({
        association_id: associationId,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        next_run_date: data.next_run_date,
        is_active: data.is_active,
        line_items: data.line_items
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recurring journal entry:', error);
      throw error;
    }

    return entry.id;
  }

  static async processRecurringEntries(associationId: string): Promise<number> {
    // Get all active recurring entries that are due
    const { data: entries, error } = await supabase
      .from('recurring_journal_entries')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .lte('next_run_date', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching recurring entries:', error);
      return 0;
    }

    let processedCount = 0;

    for (const entry of entries || []) {
      try {
        // Create journal entry
        const { data: journalEntry, error: jeError } = await supabase
          .from('journal_entries')
          .insert({
            association_id: associationId,
            entry_number: await this.generateEntryNumber(),
            description: `Auto: ${entry.description}`,
            entry_date: new Date().toISOString().split('T')[0],
            status: 'posted',
            source_type: 'recurring',
            total_amount: entry.line_items.reduce((sum: number, line: any) => 
              sum + Math.max(line.debit_amount || 0, line.credit_amount || 0), 0)
          })
          .select()
          .single();

        if (jeError) throw jeError;

        // Create line items
        const lineItems = entry.line_items.map((line: any, index: number) => ({
          journal_entry_id: journalEntry.id,
          line_number: index + 1,
          gl_account_id: line.gl_account_id,
          debit_amount: line.debit_amount || 0,
          credit_amount: line.credit_amount || 0,
          description: line.description
        }));

        const { error: lineError } = await supabase
          .from('journal_entry_line_items')
          .insert(lineItems);

        if (lineError) throw lineError;

        // Update next run date
        const nextRunDate = this.calculateNextRunDate(entry.frequency, entry.next_run_date);
        await supabase
          .from('recurring_journal_entries')
          .update({ next_run_date: nextRunDate })
          .eq('id', entry.id);

        processedCount++;
      } catch (error) {
        console.error(`Error processing recurring entry ${entry.id}:`, error);
      }
    }

    return processedCount;
  }

  static async autoReconcileBankTransactions(
    associationId: string,
    bankAccountId: string
  ): Promise<{ matched: number; unmatched: number }> {
    // Get unmatched bank transactions
    const { data: bankTransactions, error: bankError } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('bank_account_id', bankAccountId)
      .is('matched_journal_entry_id', null);

    if (bankError) {
      console.error('Error fetching bank transactions:', bankError);
      return { matched: 0, unmatched: 0 };
    }

    // Get unmatched journal entries
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entry_line_items')
      .select(`
        *,
        journal_entries!inner(*)
      `)
      .eq('journal_entries.association_id', associationId)
      .is('bank_transaction_id', null);

    if (journalError) {
      console.error('Error fetching journal entries:', journalError);
      return { matched: 0, unmatched: 0 };
    }

    let matchedCount = 0;
    
    // Simple matching algorithm based on amount and date proximity
    for (const bankTx of bankTransactions || []) {
      const matchingEntries = journalEntries?.filter(je => 
        Math.abs((je.debit_amount || 0) - (je.credit_amount || 0) - bankTx.amount) < 0.01 &&
        Math.abs(new Date(je.journal_entries.entry_date).getTime() - new Date(bankTx.transaction_date).getTime()) 
        < 7 * 24 * 60 * 60 * 1000 // Within 7 days
      );

      if (matchingEntries && matchingEntries.length === 1) {
        // Found exact match
        const journalEntry = matchingEntries[0];
        
        // Update both records
        await supabase
          .from('bank_transactions')
          .update({ matched_journal_entry_id: journalEntry.journal_entry_id })
          .eq('id', bankTx.id);

        await supabase
          .from('journal_entry_line_items')
          .update({ bank_transaction_id: bankTx.id })
          .eq('id', journalEntry.id);

        matchedCount++;
      }
    }

    return {
      matched: matchedCount,
      unmatched: (bankTransactions?.length || 0) - matchedCount
    };
  }

  static async processAssessmentBilling(associationId: string): Promise<number> {
    // Get active assessment schedules
    const { data: schedules, error } = await supabase
      .from('assessment_schedules')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .lte('next_generation_date', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching assessment schedules:', error);
      return 0;
    }

    let generatedCount = 0;

    for (const schedule of schedules || []) {
      try {
        // Get properties for this association
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .eq('association_id', associationId);

        if (propError) throw propError;

        // Generate assessments for each property
        for (const property of properties || []) {
          const { error: assessmentError } = await supabase
            .from('assessments')
            .insert({
              property_id: property.id,
              assessment_type_id: schedule.assessment_type_id,
              amount: schedule.amount,
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              payment_status: 'unpaid'
            });

          if (assessmentError) {
            console.error('Error creating assessment:', assessmentError);
          } else {
            generatedCount++;
          }
        }

        // Update next generation date
        const nextDate = this.calculateNextRunDate(schedule.schedule_type, schedule.next_generation_date);
        await supabase
          .from('assessment_schedules')
          .update({ 
            next_generation_date: nextDate,
            last_generated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);

      } catch (error) {
        console.error(`Error processing assessment schedule ${schedule.id}:`, error);
      }
    }

    return generatedCount;
  }

  static async calculateLateFees(associationId: string): Promise<number> {
    // Get overdue assessments
    const { data: overdueAssessments, error } = await supabase
      .from('assessments')
      .select(`
        *,
        properties!inner(association_id)
      `)
      .eq('properties.association_id', associationId)
      .eq('payment_status', 'unpaid')
      .lt('due_date', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching overdue assessments:', error);
      return 0;
    }

    let lateFeesApplied = 0;

    for (const assessment of overdueAssessments || []) {
      // Check if late fee already applied
      if (assessment.late_fee && assessment.late_fee > 0) continue;

      // Calculate days overdue
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(assessment.due_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue > 10) { // Grace period of 10 days
        const lateFeeAmount = Math.min(assessment.amount * 0.1, 100); // 10% or $100 max

        const { error: updateError } = await supabase
          .from('assessments')
          .update({ late_fee: lateFeeAmount })
          .eq('id', assessment.id);

        if (!updateError) {
          lateFeesApplied++;
        }
      }
    }

    return lateFeesApplied;
  }

  private static calculateNextRunDate(frequency: string, currentDate: string): string {
    const current = new Date(currentDate);
    
    switch (frequency) {
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarterly':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'annually':
        current.setFullYear(current.getFullYear() + 1);
        break;
      default:
        current.setMonth(current.getMonth() + 1);
    }

    return current.toISOString().split('T')[0];
  }

  private static async generateEntryNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    return `AUTO-${year}${month}-${Date.now().toString().slice(-6)}`;
  }
}