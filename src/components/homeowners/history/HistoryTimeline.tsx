
import React from 'react';
import HistoryItem, { HistoryItemData } from './HistoryItem';

interface HistoryTimelineProps {
  history: HistoryItemData[];
  loading: boolean;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading history...</div>;
  }

  return (
    <div className="relative">
      <div className="absolute top-0 bottom-0 left-6 border-l-2 border-gray-200"></div>
      <div className="space-y-6">
        {history.map((item) => (
          <HistoryItem key={item.id} item={item} />
        ))}
        
        {history.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No history available for this request.
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTimeline;
