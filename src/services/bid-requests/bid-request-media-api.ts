
import { supabase } from '@/integrations/supabase/client';

/**
 * Upload an image for a bid request and update the bid request record
 */
export async function uploadBidRequestImage(file: File, bidRequestId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${bidRequestId}.${fileExt}`;
  const filePath = `${fileName}`;

  console.log('Uploading file:', file.name, 'to path:', filePath);

  const { error: uploadError } = await supabase.storage
    .from('bid-request-files')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading bid request image:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('bid-request-files')
    .getPublicUrl(filePath);

  console.log('File uploaded, public URL:', publicUrl);

  // Update bid request with image URL
  const { error: updateError } = await supabase
    .from('bid_requests')
    .update({ image_url: publicUrl })
    .eq('id', bidRequestId);

  if (updateError) {
    console.error('Error updating bid request with image URL:', updateError);
    throw updateError;
  }

  return publicUrl;
}
