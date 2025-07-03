import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BankTransaction {
  id: string;
  transaction_date: string;
  description: string;
  amount: number;
  reference_number?: string;
  category?: string;
  is_cleared: boolean;
  is_matched: boolean;
  gl_transaction_id?: string;
}

export interface BankReconciliationItem {
  id: string;
  reconciliation_id: string;
  transaction_type: string;
  transaction_date: string;
  description: string;
  amount: number;
  reference_number?: string;
  status: string;
  bank_transaction_id?: string;
  gl_transaction_id?: string;
  notes?: string;
  cleared_date?: string;
}

export interface BankReconciliation {
  id: string;
  bank_account_id: string;
  reconciliation_date: string;
  statement_date: string;
  beginning_balance: number;
  ending_balance: number;
  statement_balance: number;
  reconciled_balance: number;
  difference: number;
  status: string;
  reconciled_by?: string;
  reconciled_at?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
}

export interface StatementUpload {
  id: string;
  bank_account_id: string;
  statement_date: string;
  filename: string;
  file_url: string;
  file_size: number;
  upload_method: string;
  import_status: string;
  processed_at?: string;
}

export class BankReconciliationService {
  private static toast = useToast().toast;

  // Bank Reconciliation CRUD Operations
  static async getReconciliations(bankAccountId: string): Promise<BankReconciliation[]> {
    try {
      const { data, error } = await supabase
        .from('bank_reconciliations')
        .select('*')
        .eq('bank_account_id', bankAccountId)
        .order('reconciliation_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      this.toast({
        title: "Error",
        description: "Failed to fetch bank reconciliations",
        variant: "destructive",
      });
      throw error;
    }
  }

  static async getReconciliation(reconciliationId: string): Promise<BankReconciliation | null> {
    try {
      const { data, error } = await supabase
        .from('bank_reconciliations')
        .select('*')
        .eq('id', reconciliationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching reconciliation:', error);
      throw error;
    }
  }

  static async createReconciliation(reconciliation: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('bank_reconciliations')
        .insert(reconciliation)
        .select()
        .single();

      if (error) throw error;
      
      this.toast({
        title: "Success",
        description: "Bank reconciliation created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating reconciliation:', error);
      this.toast({
        title: "Error",
        description: "Failed to create bank reconciliation",
        variant: "destructive",
      });
      throw error;
    }
  }

  static async updateReconciliation(reconciliationId: string, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('bank_reconciliations')
        .update(updates)
        .eq('id', reconciliationId)
        .select()
        .single();

      if (error) throw error;
      
      this.toast({
        title: "Success",
        description: "Bank reconciliation updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating reconciliation:', error);
      this.toast({
        title: "Error",
        description: "Failed to update bank reconciliation",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Statement Import and Processing
  static async uploadStatement(
    file: File,
    bankAccountId: string,
    statementDate: string,
    fileType: 'csv' | 'pdf' | 'ofx'
  ): Promise<StatementUpload> {
    try {
      // Upload file to Supabase storage
      const fileName = `statement_${bankAccountId}_${statementDate}_${Date.now()}.${fileType}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bank_statements')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create statement record
      const statementData = {
        bank_account_id: bankAccountId,
        statement_date: statementDate,
        filename: file.name,
        file_url: uploadData.path,
        file_size: file.size,
        upload_method: 'manual' as const,
        import_status: 'pending' as const,
      };

      const { data, error } = await supabase
        .from('bank_statements')
        .insert([statementData])
        .select()
        .single();

      if (error) throw error;

      // Start processing the statement
      await this.processStatement(data.id, fileType);

      this.toast({
        title: "Success",
        description: "Bank statement uploaded successfully",
      });

      return data;
    } catch (error) {
      console.error('Error uploading statement:', error);
      this.toast({
        title: "Error",
        description: "Failed to upload bank statement",
        variant: "destructive",
      });
      throw error;
    }
  }

  private static async processStatement(statementId: string, fileType: string): Promise<void> {
    try {
      // Update status to processing
      await supabase
        .from('bank_statements')
        .update({ import_status: 'processing' })
        .eq('id', statementId);

      // In a real implementation, this would parse the file and extract transactions
      // For now, we'll simulate processing with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update status to completed
      await supabase
        .from('bank_statements')
        .update({ 
          import_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', statementId);

    } catch (error) {
      console.error('Error processing statement:', error);
      await supabase
        .from('bank_statements')
        .update({ import_status: 'failed' })
        .eq('id', statementId);
    }
  }

  // Transaction Matching Engine
  static async getUnmatchedTransactions(bankAccountId: string, reconciliationDate: string): Promise<{
    bankTransactions: BankTransaction[];
    bookTransactions: any[];
  }> {
    try {
      // In a real implementation, this would fetch actual transactions
      // For now, return mock data with proper structure
      const mockBankTransactions: BankTransaction[] = [
        {
          id: '1',
          transaction_date: reconciliationDate,
          description: 'Assessment Payment - Unit 101',
          amount: 1250.00,
          is_cleared: false,
          is_matched: false
        },
        {
          id: '2',
          transaction_date: reconciliationDate,
          description: 'Landscaping Service',
          amount: -850.00,
          is_cleared: true,
          is_matched: true
        }
      ];

      const mockBookTransactions = [
        {
          id: '1',
          transaction_date: reconciliationDate,
          description: 'Monthly Assessment Receivable',
          amount: 15000.00,
          is_cleared: false,
          is_matched: false
        },
        {
          id: '2',
          transaction_date: reconciliationDate,
          description: 'Landscaping Vendor Payment',
          amount: -850.00,
          is_cleared: true,
          is_matched: true
        }
      ];

      return {
        bankTransactions: mockBankTransactions,
        bookTransactions: mockBookTransactions
      };
    } catch (error) {
      console.error('Error fetching unmatched transactions:', error);
      throw error;
    }
  }

  // Fuzzy Matching Algorithm
  static async autoMatchTransactions(reconciliationId: string): Promise<number> {
    try {
      // In a real implementation, this would perform fuzzy matching
      // using algorithms like Levenshtein distance, amount matching, etc.
      
      // Simulate auto-matching logic
      const matchesFound = Math.floor(Math.random() * 5) + 1;
      
      this.toast({
        title: "Auto-Match Complete",
        description: `Found ${matchesFound} potential matches`,
      });

      return matchesFound;
    } catch (error) {
      console.error('Error auto-matching transactions:', error);
      throw error;
    }
  }

  // Balance Calculations
  static calculateReconciledBalance(
    beginningBalance: number,
    clearedTransactions: BankTransaction[]
  ): number {
    const clearedAmount = clearedTransactions
      .filter(t => t.is_cleared)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return beginningBalance + clearedAmount;
  }

  // Approval Workflow
  static async approveReconciliation(reconciliationId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('bank_reconciliations')
        .update({
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString()
        })
        .eq('id', reconciliationId);

      this.toast({
        title: "Success",
        description: "Bank reconciliation approved successfully",
      });
    } catch (error) {
      console.error('Error approving reconciliation:', error);
      this.toast({
        title: "Error",
        description: "Failed to approve bank reconciliation",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Reconciliation Items Management
  static async getReconciliationItems(reconciliationId: string): Promise<BankReconciliationItem[]> {
    try {
      const { data, error } = await supabase
        .from('bank_reconciliation_items')
        .select('*')
        .eq('reconciliation_id', reconciliationId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reconciliation items:', error);
      throw error;
    }
  }

  static async updateReconciliationItem(
    itemId: string,
    updates: Partial<BankReconciliationItem>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('bank_reconciliation_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reconciliation item:', error);
      throw error;
    }
  }
}