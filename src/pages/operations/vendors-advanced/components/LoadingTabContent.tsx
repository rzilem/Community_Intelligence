
import React from 'react';

const LoadingTabContent: React.FC = () => {
  return (
    <div className="flex justify-center py-8">
      <div className="text-center">
        <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2">Loading vendors...</p>
      </div>
    </div>
  );
};

export default LoadingTabContent;
