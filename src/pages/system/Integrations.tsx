
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { PuzzlePiece } from 'lucide-react';

const Integrations = () => {
  return <PageTemplate 
    title="Integrations" 
    icon={<PuzzlePiece className="h-8 w-8" />}
    description="Configure and manage third-party system integrations."
  />;
};

export default Integrations;
