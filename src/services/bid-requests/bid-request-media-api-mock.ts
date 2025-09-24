// Mock implementation for bid request media API

export async function uploadBidRequestImage(bidRequestId: string, file: File): Promise<string> {
  console.log('=== MOCK: Uploading bid request image ===', bidRequestId, file.name);
  
  // Return a mock URL
  const mockImageUrl = `https://via.placeholder.com/400x300?text=Mock+Image+${file.name}`;
  
  return mockImageUrl;
}

export async function uploadBidRequestAttachment(bidRequestId: string, file: File): Promise<string> {
  console.log('=== MOCK: Uploading bid request attachment ===', bidRequestId, file.name);
  
  // Return a mock URL
  const mockAttachmentUrl = `https://example.com/mock-attachment-${Date.now()}-${file.name}`;
  
  return mockAttachmentUrl;
}