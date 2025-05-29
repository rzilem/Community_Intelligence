// pages/bid-requests/respond/[id].tsx
import VendorResponse from '../../../components/bidRequests/VendorResponse';
import { bidRequestService } from '../../../services/bidRequestService';

export default function RespondToBid({ bidRequestId, vendorId, token }) {
  const handleSubmit = async (data) => {
    await bidRequestService.submitVendorBid(bidRequestId, vendorId, data);
    // Handle success
  };

  return (
    <VendorResponse
      bidRequestId={bidRequestId}
      vendorId={vendorId}
      token={token}
      onSubmit={handleSubmit}
    />
  );
}
