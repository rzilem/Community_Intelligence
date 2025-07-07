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
    // Create a journal entry to simulate recurring functionality
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert({
        association_id: associationId,
        entry_number: `REC-${Date.now()}`,
        description: `Recurring: ${data.name}`,
        entry_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        source_type: 'recurring',
        total_amount: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recurring journal entry:', error);
      throw error;
    }

    return entry.id;
  }

  static async getRecurringJournalEntries(associationId: string): Promise<RecurringJournalEntry[]> {
    // Return mock data for demo purposes since the table doesn't exist in types
    return [
      {
        id: '1',
        name: 'Monthly HOA Dues',
        description: 'Monthly assessment collection',
        frequency: 'monthly',
        next_run_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
        line_items: [
          {
            gl_account_id: '4000',
            credit_amount: 5000,
            description: 'HOA Dues Revenue'
          },
          {
            gl_account_id: '1200',
            debit_amount: 5000,
            description: 'Accounts Receivable'
          }
        ]
      },
      {
        id: '2',
        name: 'Quarterly Maintenance Reserve',
        description: 'Reserve fund allocation',
        frequency: 'quarterly',
        next_run_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
        line_items: [
          {
            gl_account_id: '6000',
            debit_amount: 2500,
            description: 'Maintenance Reserve Transfer'
          },
          {
            gl_account_id: '1000',
            credit_amount: 2500,
            description: 'Operating Account'
          }
        ]
      }
    ];
  }

  static async processRecurringEntries(associationId: string): Promise<number> {
    // Simulate processing recurring entries
    const recurringEntries = await this.getRecurringJournalEntries(associationId);
    let processedCount = 0;

    for (const entry of recurringEntries) {
      try {
        // Create journal entry
        const totalAmount = entry.line_items.reduce((sum, line) => 
          sum + Math.max(line.debit_amount || 0, line.credit_amount || 0), 0);

        const { data: journalEntry, error: jeError } = await supabase
          .from('journal_entries')
          .insert({
            association_id: associationId,
            entry_number: await this.generateEntryNumber(),
            description: `Auto: ${entry.description}`,
            entry_date: new Date().toISOString().split('T')[0],
            status: 'posted',
            source_type: 'recurring',
            total_amount: totalAmount
          })
          .select()
          .single();

        if (jeError) throw jeError;

        // Create line items
        const lineItems = entry.line_items.map((line, index) => ({
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
    // Get unmatched bank transactions - using existing journal_entries as fallback
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('association_id', associationId)
      .eq('status', 'posted')
      .order('entry_date', { ascending: false })
      .limit(10);

    if (journalError) {
      console.error('Error fetching journal entries:', journalError);
      return { matched: 0, unmatched: 0 };
    }

    // Mock matching process for demo
    const mockMatched = Math.floor(Math.random() * 5) + 1;
    const mockUnmatched = Math.floor(Math.random() * 3);

    return {
      matched: mockMatched,
      unmatched: mockUnmatched
    };
  }

  static async processAssessmentBilling(associationId: string): Promise<number> {
    // Get active assessment schedules
    const { data: schedules, error } = await supabase
      .from('assessment_schedules')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

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
          .eq('association_id', associationId)
          .limit(10);

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
      .lt('due_date', new Date().toISOString().split('T')[0])
      .limit(20);

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

  static async getAutomationStats(associationId: string) {
    // Return mock stats for demo
    return {
      recurringEntriesProcessed: 12,
      bankTransactionsMatched: 45,
      assessmentsBilled: 156,
      lateFeesCalculated: 8,
      lastProcessedAt: new Date().toISOString(),
      upcomingScheduledTasks: 3
    };
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