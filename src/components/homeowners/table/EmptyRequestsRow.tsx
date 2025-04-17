
import React from 'react';

interface EmptyRequestsRowProps {
  colSpan: number;
}

const EmptyRequestsRow: React.FC<EmptyRequestsRowProps> = ({ colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="py-6 text-center text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p>No homeowner requests found.</p>
          <p className="text-sm">Create a new request or adjust your filters.</p>
        </div>
      </td>
    </tr>
  );
};

export default EmptyRequestsRow;
