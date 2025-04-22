
import React from 'react';

export interface EmptyRequestsRowProps {
  message: string;
  colSpan?: number;
}

export const EmptyRequestsRow: React.FC<EmptyRequestsRowProps> = ({
  message,
  colSpan
}) => {
  return (
    <div className="p-8 text-center" style={{ gridColumn: colSpan ? `span ${colSpan}` : 'auto' }}>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default EmptyRequestsRow;
