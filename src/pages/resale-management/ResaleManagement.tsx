
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ScrollText } from 'lucide-react';

const ResaleManagement = () => {
  return <PageTemplate 
    title="Resale Management" 
    icon={<ScrollText className="h-8 w-8" />}
    description="Manage property resale documentation and processes."
  />;
};

export default ResaleManagement;
