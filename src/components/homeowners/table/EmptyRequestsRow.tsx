
import React from 'react';

export interface EmptyRequestsRowProps {
  colSpan: number;
}

const EmptyRequestsRow: React.FC<EmptyRequestsRowProps> = ({ colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-muted-foreground">
        No requests found
      </td>
    </tr>
  );
};

export default EmptyRequestsRow;
