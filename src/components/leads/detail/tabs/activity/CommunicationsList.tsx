
import React from 'react';
import CommunicationItem from './CommunicationItem';

interface CommunicationsListProps {
  communications: Array<{
    id: number;
    type: string;
    subject: string;
    content: string;
    date: string;
    from: string;
    to: string;
  }>;
}

const CommunicationsList: React.FC<CommunicationsListProps> = ({ communications }) => {
  return (
    <div className="space-y-4">
      {communications.length > 0 ? 
        communications.map(communication => (
          <CommunicationItem key={communication.id} communication={communication} />
        )) : 
        <p className="text-muted-foreground text-center py-8">
          No communication history available for this lead.
        </p>
      }
    </div>
  );
};

export default CommunicationsList;
