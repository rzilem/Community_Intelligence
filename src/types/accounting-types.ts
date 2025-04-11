
export type GLAccount = {
  code: string;
  description: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  category: string;
};

export type ReportCategory = {
  title: string;
  reports: string[];
};
