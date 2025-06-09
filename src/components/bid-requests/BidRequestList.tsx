
import React from 'react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import BidRequestCard from './BidRequestCard';

interface BidRequestListProps {
  bidRequests: BidRequestWithVendors[];
  onEdit?: (bidRequest: BidRequestWithVendors) => void;
  onDelete?: (id: string) => void;
}

const BidRequestList: React.FC<BidRequestListProps> = ({
  bidRequests,
  onEdit,
  onDelete
}) => {
  if (bidRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bid requests found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bidRequests.map((bidRequest) => (
        <BidRequestCard
          key={bidRequest.id}
          bidRequest={bidRequest}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BidRequestList;
