
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';

const GLAccounts = () => {
  return <PageTemplate 
    title="GL Accounts" 
    icon={<Database className="h-8 w-8" />}
    description="Manage general ledger accounts and chart of accounts."
  />;
};

export default GLAccounts;
