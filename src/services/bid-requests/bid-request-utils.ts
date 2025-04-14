
import { BidRequestWithVendors } from '@/types/bid-request-types';

/**
 * Maps a category to its corresponding image URL
 */
export function getCategoryImageUrl(category: string): string {
  const categoryImageMap: Record<string, string> = {
    'access_system': '/public/lovable-uploads/f12ed9b3-cd47-4ba5-906e-2767368c119a.png',
    'arborist': '/public/lovable-uploads/e90108c2-2755-4279-a815-f594603fca7e.png',
    'concrete': '/public/lovable-uploads/b6e52903-4de7-438c-9720-949fdc6e10f1.png',
    'construction': '/public/lovable-uploads/e44c8451-97f3-4e21-a1f6-3164610fd910.png',
    'landscaping': '/public/lovable-uploads/bd464cd6-d2b0-43bc-bdd2-8445695e564e.png',
    // Add more category images as they become available
  };

  return categoryImageMap[category] || '/placeholder.svg';
}

/**
 * Format bid request data for display
 */
export function formatBidRequestForDisplay(bidRequest: Partial<BidRequestWithVendors>): Partial<BidRequestWithVendors> {
  return {
    ...bidRequest,
    // Add category image URL if not already present
    imageUrl: bidRequest.imageUrl || getCategoryImageUrl(bidRequest.category || '')
  };
}
