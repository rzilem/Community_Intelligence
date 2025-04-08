
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building } from 'lucide-react';

const BankAccounts = () => {
  return <PageTemplate 
    title="Bank Accounts" 
    icon={<Building className="h-8 w-8" />}
    description="Manage association bank accounts and financial institutions."
  />;
};

export default BankAccounts;
