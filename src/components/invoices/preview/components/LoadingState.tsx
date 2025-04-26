
import React from 'react';

export const LoadingState = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading document...</p>
    </div>
  </div>
);

