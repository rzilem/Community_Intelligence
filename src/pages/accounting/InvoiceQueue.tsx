
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt } from 'lucide-react';

const InvoiceQueue = () => {
  return <PageTemplate 
    title="Invoice Queue" 
    icon={<Receipt className="h-8 w-8" />}
    description="Process and approve incoming vendor invoices for payment."
  />;
};

export default InvoiceQueue;
