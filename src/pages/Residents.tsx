
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Users2 } from 'lucide-react';

const Residents = () => {
  return <PageTemplate 
    title="Residents" 
    icon={<Users2 className="h-8 w-8" />}
    description="Manage resident information, contacts, and communication preferences."
  />;
};

export default Residents;
