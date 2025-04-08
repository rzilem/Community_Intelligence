
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { CircleDollarSign } from 'lucide-react';

const AccountStatements = () => {
  return <PageTemplate 
    title="Account Statements" 
    icon={<CircleDollarSign className="h-8 w-8" />}
    description="Generate account statements for closing and resale transactions."
  />;
};

export default AccountStatements;
