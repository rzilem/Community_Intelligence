
import React from 'react';
import PageTemplate from './PageTemplate';
import { DollarSign } from 'lucide-react';

const Accounting = () => {
  return <PageTemplate title="Accounting" icon={<DollarSign className="h-8 w-8" />} />;
};

export default Accounting;
