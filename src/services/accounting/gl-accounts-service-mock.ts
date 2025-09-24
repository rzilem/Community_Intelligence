export interface GLAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  account_subtype?: string;
  normal_balance: 'debit' | 'credit';
  current_balance: number;
  association_id: string;
  parent_account_id?: string;
  is_active: boolean;
  is_system_account: boolean;
  created_at: string;
  updated_at: string;
}

export interface GLAccountWithBalance extends GLAccount {
  children?: GLAccountWithBalance[];
  isExpanded?: boolean;
}

export class GLAccountsService {
  // Mock data
  private static mockAccounts: GLAccount[] = [
    {
      id: '1',
      account_code: '1000',
      account_name: 'Cash - Operating',
      account_type: 'asset',
      account_subtype: 'current_asset',
      normal_balance: 'debit',
      current_balance: 50000,
      association_id: 'mock-association',
      is_active: true,
      is_system_account: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      account_code: '1100',
      account_name: 'Accounts Receivable',
      account_type: 'asset',
      account_subtype: 'current_asset',
      normal_balance: 'debit',
      current_balance: 15000,
      association_id: 'mock-association',
      is_active: true,
      is_system_account: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  static async getAccounts(associationId: string): Promise<GLAccount[]> {
    return this.mockAccounts.filter(acc => acc.association_id === associationId || acc.association_id === 'mock-association');
  }

  static async getChartOfAccounts(associationId: string): Promise<GLAccountWithBalance[]> {
    const accounts = await this.getAccounts(associationId);
    return this.buildAccountHierarchy(accounts);
  }

  static async createAccount(account: Partial<GLAccount>): Promise<GLAccount> {
    const newAccount: GLAccount = {
      id: crypto.randomUUID(),
      account_code: account.account_code || '',
      account_name: account.account_name || '',
      account_type: account.account_type || 'asset',
      account_subtype: account.account_subtype,
      normal_balance: account.normal_balance || 'debit',
      current_balance: 0,
      association_id: account.association_id || '',
      parent_account_id: account.parent_account_id,
      is_active: true,
      is_system_account: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockAccounts.push(newAccount);
    return newAccount;
  }

  static async updateAccount(id: string, updates: Partial<GLAccount>): Promise<GLAccount> {
    const index = this.mockAccounts.findIndex(acc => acc.id === id);
    if (index === -1) throw new Error('Account not found');

    this.mockAccounts[index] = {
      ...this.mockAccounts[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockAccounts[index];
  }

  static async deleteAccount(id: string): Promise<void> {
    const index = this.mockAccounts.findIndex(acc => acc.id === id);
    if (index === -1) throw new Error('Account not found');

    this.mockAccounts[index].is_active = false;
  }

  static async updateAccountBalance(accountId: string, amount: number, isDebit: boolean): Promise<void> {
    const account = this.mockAccounts.find(acc => acc.id === accountId);
    if (!account) throw new Error('Account not found');

    const normalBalance = account.normal_balance;
    let newBalance = account.current_balance;
    
    if ((normalBalance === 'debit' && isDebit) || (normalBalance === 'credit' && !isDebit)) {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }

    account.current_balance = newBalance;
    account.updated_at = new Date().toISOString();
  }

  static async getAccountBalance(accountId: string, startDate?: string, endDate?: string): Promise<number> {
    const account = this.mockAccounts.find(acc => acc.id === accountId);
    return account?.current_balance || 0;
  }

  private static buildAccountHierarchy(accounts: GLAccount[]): GLAccountWithBalance[] {
    const accountMap = new Map<string, GLAccountWithBalance>();
    const rootAccounts: GLAccountWithBalance[] = [];

    // Create map of all accounts
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [], isExpanded: false });
    });

    // Build hierarchy
    accounts.forEach(account => {
      const accountWithChildren = accountMap.get(account.id)!;
      
      if (account.parent_account_id) {
        const parent = accountMap.get(account.parent_account_id);
        if (parent) {
          parent.children!.push(accountWithChildren);
        }
      } else {
        rootAccounts.push(accountWithChildren);
      }
    });

    return rootAccounts;
  }

  static async createDefaultChartOfAccounts(associationId: string): Promise<void> {
    const defaultAccounts = [
      { account_code: '1000', account_name: 'Cash - Operating', account_type: 'asset', account_subtype: 'current_asset', normal_balance: 'debit' as const },
      { account_code: '1100', account_name: 'Accounts Receivable', account_type: 'asset', account_subtype: 'current_asset', normal_balance: 'debit' as const },
      { account_code: '2000', account_name: 'Accounts Payable', account_type: 'liability', account_subtype: 'current_liability', normal_balance: 'credit' as const },
      { account_code: '3000', account_name: 'Member Equity', account_type: 'equity', account_subtype: 'member_equity', normal_balance: 'credit' as const },
      { account_code: '4000', account_name: 'Assessment Income', account_type: 'revenue', account_subtype: 'assessment_income', normal_balance: 'credit' as const },
      { account_code: '6000', account_name: 'Maintenance Expenses', account_type: 'expense', account_subtype: 'maintenance_expense', normal_balance: 'debit' as const }
    ];

    for (const account of defaultAccounts) {
      await this.createAccount({
        ...account,
        association_id: associationId,
        is_system_account: true
      });
    }
  }
}