
import React from 'react';

export interface RequestsCardHeaderProps {
  title: string;
  count: number;
  isLoading: boolean;
}

export const RequestsCardHeader: React.FC<RequestsCardHeaderProps> = ({
  title,
  count,
  isLoading
}) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {!isLoading && (
        <span className="text-sm text-muted-foreground">
          {count} {count === 1 ? 'request' : 'requests'}
        </span>
      )}
    </div>
  );
};

export default RequestsCardHeader;
