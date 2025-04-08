
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { PiggyBank } from 'lucide-react';

const BudgetPlanning = () => {
  return <PageTemplate 
    title="Budget Planning" 
    icon={<PiggyBank className="h-8 w-8" />}
    description="Create and manage annual budgets for community associations."
  />;
};

export default BudgetPlanning;
