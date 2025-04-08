
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ListOrdered } from 'lucide-react';

const OrderQueue = () => {
  return <PageTemplate 
    title="Order Queue" 
    icon={<ListOrdered className="h-8 w-8" />}
    description="Track and manage resale document orders and requests."
  />;
};

export default OrderQueue;
