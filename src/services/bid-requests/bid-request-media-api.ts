
import { supabase } from '@/integrations/supabase/client';

/**
 * Upload an image for a bid request
 */
export async function uploadBidRequestImage(bidRequestId: string, file: File): Promise<string> {
  // Create a unique file path
  const filePath = `bid-requests/${bidRequestId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  
  // Upload the file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('bidrequest-images')
    .upload(filePath, file);
  
  if (uploadError) {
    console.error('Error uploading bid request image:', uploadError);
    throw uploadError;
  }
  
  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('bidrequest-images')
    .getPublicUrl(uploadData.path);
  
  const imageUrl = publicUrlData.publicUrl;
  
  // Update the bid request with the image URL
  const { error: updateError } = await supabase
    .from('bid_requests')
    .update({ image_url: imageUrl })
    .eq('id', bidRequestId);
  
  if (updateError) {
    console.error('Error updating bid request with image URL:', updateError);
    throw updateError;
  }
  
  return imageUrl;
}

/**
 * Upload an attachment for a bid request
 */
export async function uploadBidRequestAttachment(bidRequestId: string, file: File): Promise<string> {
  // Create a unique file path
  const filePath = `bid-requests/${bidRequestId}/attachments/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  
  // Upload the file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('bidrequest-attachments')
    .upload(filePath, file);
  
  if (uploadError) {
    console.error('Error uploading bid request attachment:', uploadError);
    throw uploadError;
  }
  
  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('bidrequest-attachments')
    .getPublicUrl(uploadData.path);
  
  const attachmentUrl = publicUrlData.publicUrl;
  
  // Fetch the current attachments array
  const { data: bidRequestData, error: fetchError } = await supabase
    .from('bid_requests')
    .select('attachments')
    .eq('id', bidRequestId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching bid request attachments:', fetchError);
    throw fetchError;
  }
  
  // Update the bid request with the new attachment
  const currentAttachments = bidRequestData.attachments || [];
  const updatedAttachments = [...currentAttachments, {
    url: attachmentUrl,
    name: file.name,
    type: file.type,
    size: file.size,
    uploaded_at: new Date().toISOString()
  }];
  
  const { error: updateError } = await supabase
    .from('bid_requests')
    .update({ attachments: updatedAttachments })
    .eq('id', bidRequestId);
  
  if (updateError) {
    console.error('Error updating bid request with attachment:', updateError);
    throw updateError;
  }
  
  return attachmentUrl;
}
