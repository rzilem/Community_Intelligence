
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Clipboard } from 'lucide-react';

const ResaleCertificate = () => {
  return <PageTemplate 
    title="Resale Certificate" 
    icon={<Clipboard className="h-8 w-8" />}
    description="Generate and manage resale certificates for property transfers."
  />;
};

export default ResaleCertificate;
