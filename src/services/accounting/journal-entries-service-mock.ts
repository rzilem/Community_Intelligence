export interface JournalEntry {
  id: string;
  association_id: string;
  entry_number: string;
  entry_date: string;
  description?: string;
  reference_number?: string;
  source_type: string;
  total_amount: number;
  status: 'draft' | 'posted' | 'reversed';
  posted_at?: string;
  reversed_at?: string;
  reversal_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  line_number: number;
  gl_account_id: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  property_id?: string;
  vendor_id?: string;
}

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
  private static mockEntries: JournalEntryWithLines[] = [
    {
      id: '1',
      association_id: 'mock-association',
      entry_number: 'JE-2024-0001',
      entry_date: new Date().toISOString().split('T')[0],
      description: 'Sample Journal Entry',
      source_type: 'manual',
      total_amount: 1000,
      status: 'posted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lines: [
        {
          id: '1',
          journal_entry_id: '1',
          line_number: 1,
          gl_account_id: '1',
          description: 'Debit line',
          debit_amount: 1000,
          credit_amount: 0,
          gl_account: {
            account_code: '1000',
            account_name: 'Cash - Operating'
          }
        },
        {
          id: '2',
          journal_entry_id: '1',
          line_number: 2,
          gl_account_id: '2',
          description: 'Credit line',
          debit_amount: 0,
          credit_amount: 1000,
          gl_account: {
            account_code: '4000',
            account_name: 'Assessment Income'
          }
        }
      ]
    }
  ];

  static async getJournalEntries(associationId: string, status?: string): Promise<JournalEntryWithLines[]> {
    let entries = this.mockEntries.filter(entry => 
      entry.association_id === associationId || entry.association_id === 'mock-association'
    );

    if (status) {
      entries = entries.filter(entry => entry.status === status);
    }

    return entries;
  }

  static async createJournalEntry(associationId: string, entryData: JournalEntryFormData): Promise<JournalEntry> {
    this.validateDoubleEntry(entryData.lines);

    const entryNumber = await this.generateEntryNumber(associationId);
    const totalAmount = entryData.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      association_id: associationId,
      entry_number: entryNumber,
      entry_date: entryData.entry_date,
      description: entryData.description,
      reference_number: entryData.reference_number,
      source_type: entryData.source_type,
      total_amount: totalAmount,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const lines = entryData.lines.map((line, index) => ({
      id: crypto.randomUUID(),
      journal_entry_id: newEntry.id,
      line_number: index + 1,
      gl_account_id: line.gl_account_id,
      description: line.description,
      debit_amount: line.debit_amount || 0,
      credit_amount: line.credit_amount || 0,
      property_id: line.property_id,
      vendor_id: line.vendor_id,
      gl_account: {
        account_code: `${1000 + index}`,
        account_name: `Account ${1000 + index}`
      }
    }));

    this.mockEntries.push({
      ...newEntry,
      lines
    });

    return newEntry;
  }

  static async postJournalEntry(entryId: string): Promise<void> {
    const entry = this.mockEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Journal entry not found');
    if (entry.status === 'posted') throw new Error('Journal entry already posted');

    this.validateDoubleEntry(entry.lines);

    entry.status = 'posted';
    entry.posted_at = new Date().toISOString();
    entry.updated_at = new Date().toISOString();
  }

  static async reverseJournalEntry(entryId: string, reason: string): Promise<JournalEntry> {
    const originalEntry = this.mockEntries.find(e => e.id === entryId);
    if (!originalEntry) throw new Error('Journal entry not found');
    if (originalEntry.status !== 'posted') throw new Error('Can only reverse posted entries');

    const reversingLines = originalEntry.lines.map(line => ({
      gl_account_id: line.gl_account_id,
      description: `Reversal: ${line.description || ''}`,
      debit_amount: line.credit_amount,
      credit_amount: line.debit_amount,
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

    const reversingEntry = await this.createJournalEntry(originalEntry.association_id, reversingEntryData);
    await this.postJournalEntry(reversingEntry.id);

    originalEntry.status = 'reversed';
    originalEntry.reversed_at = new Date().toISOString();
    originalEntry.reversal_reason = reason;

    return reversingEntry;
  }

  static async deleteJournalEntry(entryId: string): Promise<void> {
    const index = this.mockEntries.findIndex(e => e.id === entryId);
    if (index === -1) throw new Error('Journal entry not found');
    
    const entry = this.mockEntries[index];
    if (entry.status !== 'draft') throw new Error('Can only delete draft entries');

    this.mockEntries.splice(index, 1);
  }

  private static async generateEntryNumber(associationId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `JE-${currentYear}-`;

    const entries = this.mockEntries.filter(e => 
      e.entry_number.startsWith(prefix) && 
      (e.association_id === associationId || e.association_id === 'mock-association')
    );

    const nextNumber = entries.length + 1;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  private static validateDoubleEntry(lines: any[]): void {
    if (lines.length < 2) {
      throw new Error('Journal entry must have at least 2 lines');
    }

    const totalDebits = lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(`Debits (${totalDebits}) must equal credits (${totalCredits})`);
    }

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

  static async getJournalEntryById(entryId: string): Promise<JournalEntryWithLines | null> {
    const entry = this.mockEntries.find(e => e.id === entryId);
    return entry || null;
  }
}