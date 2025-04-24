
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RequestAttachment } from '@/types/homeowner-request-types';

/**
 * Upload an attachment for a homeowner request
 */
export async function uploadHomeownerRequestAttachment(requestId: string, file: File): Promise<RequestAttachment> {
  try {
    // Create a unique file path
    const filePath = `homeowner-requests/${requestId}/attachments/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('homeowner-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading homeowner request attachment:', uploadError);
      toast.error(`Failed to upload attachment: ${uploadError.message}`);
      throw uploadError;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('homeowner-attachments')
      .getPublicUrl(uploadData.path);
    
    const attachmentUrl = publicUrlData.publicUrl;
    
    // Create attachment object
    const attachment: RequestAttachment = {
      url: attachmentUrl,
      name: file.name,
      type: file.type,
      size: file.size
    };
    
    // Fetch the current attachments array
    const { data: requestData, error: fetchError } = await supabase
      .from('homeowner_requests')
      .select('attachments')
      .eq('id', requestId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching request attachments:', fetchError);
      toast.error(`Failed to fetch request: ${fetchError.message}`);
      throw fetchError;
    }
    
    // Update the request with the new attachment
    // First, prepare the current attachments as plain objects
    let currentAttachments = [];
    
    if (requestData.attachments) {
      // Convert to array if it's not already (safety check)
      currentAttachments = Array.isArray(requestData.attachments) 
        ? requestData.attachments 
        : [];
    }
      
    // Add the new attachment as a plain object
    const updatedAttachments = [
      ...currentAttachments,
      {
        url: attachment.url,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size
      }
    ];
    
    const { error: updateError } = await supabase
      .from('homeowner_requests')
      .update({ attachments: updatedAttachments })
      .eq('id', requestId);
    
    if (updateError) {
      console.error('Error updating request with attachment:', updateError);
      toast.error(`Failed to update request: ${updateError.message}`);
      throw updateError;
    }
    
    toast.success('Attachment uploaded successfully');
    return attachment;
  } catch (error) {
    console.error('Unexpected error in uploadHomeownerRequestAttachment:', error);
    toast.error('An unexpected error occurred during attachment upload');
    throw error;
  }
}
