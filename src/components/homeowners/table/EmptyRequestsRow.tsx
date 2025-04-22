
import React from 'react';

export interface EmptyRequestsRowProps {
  message: string;
}

export const EmptyRequestsRow: React.FC<EmptyRequestsRowProps> = ({
  message
}) => {
  return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default EmptyRequestsRow;
