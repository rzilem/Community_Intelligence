
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2 } from 'lucide-react';

const Vendors = () => {
  return <PageTemplate 
    title="Vendors" 
    icon={<Building2 className="h-8 w-8" />}
    description="Manage vendor relationships, contracts, and service providers."
  />;
};

export default Vendors;
