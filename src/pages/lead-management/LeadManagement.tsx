
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { User } from 'lucide-react';

const LeadManagement = () => {
  return <PageTemplate 
    title="Lead Management" 
    icon={<User className="h-8 w-8" />}
    description="Manage and track potential new clients and business opportunities."
  />;
};

export default LeadManagement;
