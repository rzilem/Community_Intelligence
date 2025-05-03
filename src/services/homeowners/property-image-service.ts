
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Updates a property image in Supabase storage and updates the property record
 */
export const updatePropertyImage = async (
  propertyId: string, 
  file: File
): Promise<{ url?: string; error?: string }> => {
  try {
    // Upload file to storage
    const fileName = `property-${propertyId}-${Date.now()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(`public/${fileName}`, file);

    if (uploadError) {
      console.error('Error uploading property image:', uploadError);
      return { error: uploadError.message };
    }
    
    // Get public URL
    const { data: urlData } = await supabase.storage
      .from('property-images')
      .getPublicUrl(`public/${fileName}`);

    const imageUrl = urlData.publicUrl;

    // Update property with image URL
    const { error: updateError } = await supabase
      .from('properties')
      .update({ image_url: imageUrl })
      .eq('id', propertyId);

    if (updateError) {
      console.error('Error updating property with image URL:', updateError);
      return { error: updateError.message };
    }

    return { url: imageUrl };
  } catch (error: any) {
    console.error('Unexpected error updating property image:', error);
    return { error: error.message };
  }
};

/**
 * Retrieves the property image URL for a given property ID
 */
export const getPropertyImage = async (propertyId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('image_url')
      .eq('id', propertyId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching property image:', error);
      return null;
    }
    
    return data.image_url;
  } catch (error) {
    console.error('Error fetching property image:', error);
    return null;
  }
};
