
import React from 'react';
import { User } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';

const LoadingState: React.FC = () => {
  return (
    <PageTemplate 
      title="Lead Details" 
      icon={<User className="h-8 w-8" />}
      description="Loading lead information..."
    >
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    </PageTemplate>
  );
};

export default LoadingState;
