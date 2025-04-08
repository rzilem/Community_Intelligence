
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Wallet } from 'lucide-react';

const Payments = () => {
  return <PageTemplate 
    title="Payments" 
    icon={<Wallet className="h-8 w-8" />}
    description="Process and track payments to vendors and service providers."
  />;
};

export default Payments;
