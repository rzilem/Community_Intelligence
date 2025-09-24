export interface BankReconciliation {
  id: string;
  bank_account_id: string;
  reconciliation_date: string;
  statement_date: string;
  beginning_balance: number;
  ending_balance: number;
  is_reconciled: boolean;
  reconciled_by?: string;
  file_url?: string;
}

export class BankReconciliationService {
  static async getReconciliations(bankAccountId: string): Promise<BankReconciliation[]> {
    // Mock data
    return [
      {
        id: '1',
        bank_account_id: bankAccountId,
        reconciliation_date: new Date().toISOString().split('T')[0],
        statement_date: new Date().toISOString().split('T')[0],
        beginning_balance: 10000.00,
        ending_balance: 12500.00,
        is_reconciled: true,
        reconciled_by: 'mock-user-id'
      }
    ];
  }

  static async createReconciliation(data: any): Promise<BankReconciliation> {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      ...data,
      is_reconciled: false,
    };
  }

  static async updateReconciliation(id: string, data: any): Promise<BankReconciliation> {
    // Mock implementation
    return {
      id,
      ...data,
    };
  }

  static async deleteReconciliation(id: string): Promise<void> {
    console.log('Mock: Deleting reconciliation:', id);
  }

  static async uploadBankStatement(file: File, bankAccountId: string): Promise<any> {
    console.log('Mock: Uploading bank statement for account:', bankAccountId);
    return {
      id: crypto.randomUUID(),
      filename: file.name,
      file_size: file.size,
      upload_method: 'manual',
      import_status: 'pending'
    };
  }

  static async getReconciliationItems(reconciliationId: string): Promise<any[]> {
    // Mock reconciliation items
    return [
      {
        id: '1',
        transaction_id: 'tx-1',
        transaction_date: new Date().toISOString().split('T')[0],
        description: 'Sample Transaction',
        amount: 100.00,
        is_matched: false
      }
    ];
  }

  static async updateReconciliationItem(itemId: string, data: any): Promise<any> {
    console.log('Mock: Updating reconciliation item:', itemId, data);
    return { id: itemId, ...data };
  }

  static async uploadStatement(file: File, bankAccountId: string): Promise<any> {
    // Alias for uploadBankStatement
    return this.uploadBankStatement(file, bankAccountId);
  }
}