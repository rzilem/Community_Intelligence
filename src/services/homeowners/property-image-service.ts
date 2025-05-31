
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Updates a property image in Supabase storage and updates the property record
 * Note: This creates a custom field since image_url doesn't exist in the properties table
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

    // Since image_url doesn't exist in properties table, we'll store it separately
    // For now, we'll just return the URL without updating the properties table
    // In a production app, you'd want to add an image_url column to properties table
    console.log('Property image uploaded successfully:', imageUrl);

    return { url: imageUrl };
  } catch (error: any) {
    console.error('Unexpected error updating property image:', error);
    return { error: error.message };
  }
};

/**
 * Retrieves the property image URL for a given property ID
 * Note: Since image_url doesn't exist in properties table, this returns null for now
 */
export const getPropertyImage = async (propertyId: string): Promise<string | null> => {
  try {
    // Since image_url doesn't exist in the properties table, we can't fetch it directly
    // In a real implementation, you'd either:
    // 1. Add an image_url column to the properties table, or
    // 2. Create a separate property_images table
    // For now, we'll return null
    console.log('Property image retrieval not implemented - image_url column missing from properties table');
    return null;
  } catch (error) {
    console.error('Error fetching property image:', error);
    return null;
  }
};
