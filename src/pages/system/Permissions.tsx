
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Shield } from 'lucide-react';

const Permissions = () => {
  return <PageTemplate 
    title="Permissions" 
    icon={<Shield className="h-8 w-8" />}
    description="Configure user roles and access permissions."
  />;
};

export default Permissions;
