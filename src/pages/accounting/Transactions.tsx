
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt } from 'lucide-react';

const Transactions = () => {
  return <PageTemplate 
    title="Transactions" 
    icon={<Receipt className="h-8 w-8" />}
    description="Review and manage all financial transactions."
  />;
};

export default Transactions;
