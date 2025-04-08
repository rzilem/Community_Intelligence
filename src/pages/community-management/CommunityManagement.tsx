
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building } from 'lucide-react';

const CommunityManagement = () => {
  return <PageTemplate 
    title="Community Management" 
    icon={<Building className="h-8 w-8" />}
    description="Centralized management for all your community associations."
  />;
};

export default CommunityManagement;
